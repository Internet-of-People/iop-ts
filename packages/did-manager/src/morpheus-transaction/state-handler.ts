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
  IDryRunOperationError, IOperationData,
} from '../interfaces';
import { fromData, Signed } from './operations';

export class MorpheusStateHandler implements IMorpheusStateHandler {
  public get query(): IMorpheusQueries {
    if (this.corrupted) {
      throw new Error('Layer2 is corrupted.');
    }
    return this.state.query;
  }

  private static readonly CORRUPTED_ERR_MSG = 'Layer 2 state is corrupt. All incoming transaction will be ignored.';
  public lastSeenBlockHeight = 0;
  private state: IMorpheusState = new MorpheusState();
  private corrupted = false;

  public constructor(
    private readonly logger: IAppLog,
    private readonly eventEmitter: NodeJS.EventEmitter,
  ) {
  }

  public dryRun(operationAttempts: IOperationData[]): IDryRunOperationError[] {
    if (this.corrupted) {
      return [{
        /* eslint no-undefined: 0 */
        invalidOperationAttempt: undefined,
        message: MorpheusStateHandler.CORRUPTED_ERR_MSG,
      }];
    }

    const errors: IDryRunOperationError[] = [];
    let lastSuccessIndex = 0;

    try {
      const tempState = this.state.clone();
      const apply = this.atHeight(this.lastSeenBlockHeight, tempState.apply, false);

      for (const operationData of operationAttempts) {
        const operation = fromData(operationData);
        operation.accept(apply);
        lastSuccessIndex++;
      }
    } catch (e) {
      // TODO later we need more granular errors, not just one
      errors.push({
        invalidOperationAttempt: operationAttempts[lastSuccessIndex],
        message: e.message,
      });
    }

    return errors;
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    if (this.corrupted) {
      this.logger.error(MorpheusStateHandler.CORRUPTED_ERR_MSG);
      return;
    }

    try {
      this.logger.debug(`applyTransactionToState tx: ${stateChange.transactionId}...`);
      this.logger.debug(` contains ${stateChange.asset.operationAttempts.length} operations...`);
      this.setLastSeenBlock(stateChange.blockHeight, false);

      const newState = this.state.clone();
      const apply = this.atHeight(stateChange.blockHeight, newState.apply, false);

      for (const operationData of stateChange.asset.operationAttempts) {
        this.logger.debug(`Applying operation ${operationData.operation}...`);
        const operation = fromData(operationData);
        operation.accept(apply);
        this.logger.debug(`Operation ${operationData.operation} applied`);
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
      this.logger.error(MorpheusStateHandler.CORRUPTED_ERR_MSG);
      return;
    }

    try {
      this.logger.debug(`revertTransactionFromState tx: ${stateChange.transactionId}...`);
      this.logger.debug(`contains ${stateChange.asset.operationAttempts.length} operations...`);
      this.setLastSeenBlock(stateChange.blockHeight, true);
      const confirmed = this.state.query.isConfirmed(stateChange.transactionId);

      if (!confirmed.isPresent()) {
        throw new Error(`Transaction ${stateChange.transactionId} was not confirmed, cannot revert.`);
      }

      if (confirmed.get()) {
        this.state.revert.confirmTx(stateChange.transactionId);
        const revert = this.atHeight(stateChange.blockHeight, this.state.revert, true);

        for (const operationData of stateChange.asset.operationAttempts.slice().reverse()) {
          this.logger.debug(`Reverting operation ${operationData.operation}...`);
          const operation = fromData(operationData);
          operation.accept(revert);
          this.logger.debug('Operation reverted');
        }
      } else {
        this.state.revert.rejectTx(stateChange.transactionId);
      }
    } catch (e) {
      this.logger.error(`${MorpheusStateHandler.CORRUPTED_ERR_MSG} Error: ${e}`);
      this.corrupted = true;
      this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
    }
  }

  private setLastSeenBlock(stateChangeHeight: number, revert: boolean): void {
    if (
      !revert && stateChangeHeight < this.lastSeenBlockHeight ||
      revert && stateChangeHeight > this.lastSeenBlockHeight
    ) {
      this.corrupted = true;
      this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
      const errDetail = revert ? '>' : '<';
      throw new Error(
        `${MorpheusStateHandler.CORRUPTED_ERR_MSG} Error: the incoming tx's height is ${errDetail} last seen height.`,
      );
    }
    this.lastSeenBlockHeight = stateChangeHeight;
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
      },
      tombstoneDid(did: string): void {
        state.tombstoneDid(height, signerAuth, did);
      },
    };
  }

  private atHeight(height: number, state: IMorpheusOperations, reverse: boolean): IOperationVisitor<void> {
    return {
      signed: (operations: ISignedOperationsData): void => {
        const signableOperations = Signed.getAuthenticatedOperations(operations);
        const signerAuth = authenticationFromData(operations.signerPublicKey);
        const atHeightSignable = this.atHeightSignable(height, signerAuth, state);

        for (const signable of reverse ? signableOperations.slice().reverse() : signableOperations) {
          this.logger.debug(`Applying signable operation ${signable.type}...`);
          signable.accept(atHeightSignable);
          this.logger.debug(`Signable operation ${signable.type} applied`);
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
