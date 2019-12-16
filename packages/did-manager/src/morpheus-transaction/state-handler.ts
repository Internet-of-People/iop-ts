import { IAppLog } from '@internet-of-people/logger';
import { MorpheusState } from './state';
import {
  Authentication,
  authenticationFromData,
  Did,
  IMorpheusOperations,
  IMorpheusQueries,
  IMorpheusState,
  IMorpheusStateHandler,
  IOperationVisitor,
  ISignableOperationVisitor,
  ISignedOperationsData,
  IStateChange,
  MorpheusEvents,
  Right,
} from '../interfaces';
import { fromData, Signed } from './operations';

export class MorpheusStateHandler implements IMorpheusStateHandler {
  public get query(): IMorpheusQueries {
    if (this.corrupted) {
      throw new Error('Layer2 is corrupted.');
    }
    return this.state.query;
  }

  private state: IMorpheusState = new MorpheusState();
  private corrupted = false;

  public constructor(
    private readonly logger: IAppLog,
    private readonly eventEmitter: NodeJS.EventEmitter,
  ) {
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    if (this.corrupted) {
      this.logger.error('State is corrupted, not accepting applys anymore');
      return;
    }

    try {
      this.logger.debug(`applyTransactionToState tx: ${stateChange.transactionId}...`);
      this.logger.debug(` contains ${stateChange.asset.operationAttempts.length} operations...`);
      const newState = this.state.clone();
      const apply = this.atHeight(stateChange.blockHeight, newState.apply);

      for (const operationData of stateChange.asset.operationAttempts) {
        this.logger.debug(`Applying operation ${operationData.operation}...`);
        const operation = fromData(operationData);
        operation.accept(apply);
        this.logger.debug('Operation applied');
      }
      newState.apply.confirmTx(stateChange.transactionId);
      this.state = newState;
    } catch (e) {
      this.logger.info(`Transaction could not be applied. Error: ${e}, TX: ${JSON.stringify(stateChange)}`);
      this.state.apply.rejectTx(stateChange.transactionId);
    }
  }

  public revertTransactionFromState(stateChange: IStateChange): void {
    if (this.corrupted) {
      this.logger.error('State is corrupted, not accepting applys anymore');
      return;
    }

    try {
      this.logger.debug(`revertTransactionFromState tx: ${stateChange.transactionId}...`);
      this.logger.debug(`contains ${stateChange.asset.operationAttempts.length} operations...`);
      const confirmed = this.state.query.isConfirmed(stateChange.transactionId);

      if (!confirmed.isPresent()) {
        throw new Error(`Transaction ${stateChange.transactionId} was not confirmed, cannot revert.`);
      }

      if (confirmed.get()) {
        this.state.revert.confirmTx(stateChange.transactionId);
        const revert = this.atHeight(stateChange.blockHeight, this.state.revert);

        for (const operationData of stateChange.asset.operationAttempts) {
          this.logger.debug(`Reverting operation ${operationData.operation}...`);
          const operation = fromData(operationData);
          operation.accept(revert);
          this.logger.debug('Operation reverted');
        }
      } else {
        this.state.revert.rejectTx(stateChange.transactionId);
      }
    } catch (e) {
      this.logger.error(`Layer 2 state is corrupt. All incoming transaction will be ignored. Error: ${e}`);
      this.corrupted = true;
      this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
    }
  }

  private atHeightSignable(
    height: number,
    signerAuth: Authentication,
    state: IMorpheusOperations,
  ): ISignableOperationVisitor<void> {
    return {
      addKey: (did: Did, newAuth: Authentication, expiresAtHeight?: number): void => {
        state.addKey(height, signerAuth, did, newAuth, expiresAtHeight);
      },
      revokeKey: (did: Did, auth: Authentication): void => {
        state.revokeKey(height, signerAuth, did, auth);
      },
      addRight: (did: Did, auth: Authentication, right: Right): void => {
        state.addRight(height, signerAuth, did, auth, right);
      },
      revokeRight: (did: Did, auth: Authentication, right: Right): void => {
        state.revokeRight(height, signerAuth, did, auth, right);
      }
    };
  }

  private atHeight(height: number, state: IMorpheusOperations): IOperationVisitor<void> {
    return {
      signed: (operations: ISignedOperationsData): void => {
        const signableOperations = Signed.getAuthenticatedOperations(operations);
        const signerAuth = authenticationFromData(operations.signerPublicKey);
        const atHeightSignable = this.atHeightSignable(height, signerAuth, state);

        for (const signable of signableOperations) {
          this.logger.debug(`Applying signable operation ${signable.type}...`);
          signable.accept(atHeightSignable);
          this.logger.debug('Operation applied');
        }
      },
      registerBeforeProof: (contentId: string): void => {
        state.registerBeforeProof(contentId, height);
      },
      revokeBeforeProof: (contentId: string): void => {
        state.revokeBeforeProof(contentId, height);
      },
    };
  }
}
