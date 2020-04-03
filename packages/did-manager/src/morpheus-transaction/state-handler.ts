import { Crypto, Layer1, Types, Utils } from '@internet-of-people/sdk';
type Authentication = Types.Crypto.Authentication;
type Did = Crypto.Did;
type Right = Types.Sdk.Right;
type TransactionId = Types.Sdk.TransactionId;
type IOperationData = Types.Layer1.IOperationData;
type IOperationVisitor<T> = Types.Layer1.IOperationVisitor<T>;
type ISignableOperationVisitor<T> = Types.Layer1.ISignableOperationVisitor<T>;
type ISignedOperationsData = Types.Layer1.ISignedOperationsData;

import { MorpheusState } from './state';
import {
  IBlockHeightChange,
  IDryRunOperationError,
  IMorpheusOperations,
  IMorpheusQueries,
  IMorpheusState,
  IMorpheusStateHandler,
  IStateChange,
  MorpheusEvents,
} from '../interfaces';

export class MorpheusStateHandler implements IMorpheusStateHandler {
  public get query(): IMorpheusQueries {
    if (this.corrupted) {
      throw new Error('Layer2 is corrupted.');
    }
    return this.state.query;
  }

  public static readonly CORRUPTED_ERR_MSG = 'Layer 2 state is corrupt. All incoming changes will be ignored.';
  private state: IMorpheusState = new MorpheusState();
  private corrupted = false;

  public constructor(
    private readonly logger: Utils.IAppLog,
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
      const applyVisitor = this.visitorPerformOperationAtHeight(
        this.state.query.lastSeenBlockHeight(), tempState.apply, false);

      for (const operationData of operationAttempts) {
        const operation = Layer1.fromData(operationData);
        operation.accept(applyVisitor);
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

  public applyEmptyBlockToState(change: IBlockHeightChange): void {
    if (this.corrupted) {
      this.logger.error(MorpheusStateHandler.CORRUPTED_ERR_MSG);
      return;
    }
    this.logger.debug(`applyEmptyBlockToState height: ${change.blockHeight} id: ${change.blockId}...`);
    this.setLastSeenBlock(change.blockHeight, this.state.apply);
  }

  public applyTransactionToState(change: IStateChange): void {
    if (this.corrupted) {
      this.logger.error(MorpheusStateHandler.CORRUPTED_ERR_MSG);
      return;
    }

    try {
      this.logger.debug(`applyTransactionToState tx: ${change.transactionId}...`);
      this.logger.debug(` contains ${change.asset.operationAttempts.length} operations...`);
      this.setLastSeenBlock(change.blockHeight, this.state.apply);

      for (const operationData of change.asset.operationAttempts) {
        this.logger.debug(`Registering operation attempt ${operationData.operation}...`);
        const operation = Layer1.fromData(operationData);
        this.state.apply.registerOperationAttempt(change.blockHeight, change.transactionId, operation);
      }

      const newState = this.state.clone();
      const applyVisitor = this.visitorPerformOperationAtHeight(
        change.blockHeight,
        newState.apply,
        false,
      );

      for (const operationData of change.asset.operationAttempts) {
        this.logger.debug(`Applying operation ${operationData.operation}...`);
        const operation = Layer1.fromData(operationData);
        operation.accept(applyVisitor);
        this.logger.debug(`Operation ${operationData.operation} applied`);
      }

      newState.apply.confirmTx(change.transactionId);
      this.state = newState;
    } catch (e) {
      this.logger.info(`Transaction could not be applied. Error: ${e}, TX: ${JSON.stringify(change)}`);
      this.state.apply.rejectTx(change.transactionId);
    }
  }

  public revertEmptyBlockFromState(change: IBlockHeightChange): void {
    if (this.corrupted) {
      this.logger.error(MorpheusStateHandler.CORRUPTED_ERR_MSG);
      return;
    }
    this.logger.debug(`revertEmptyBlockToState height: ${change.blockHeight} id: ${change.blockId}...`);
    this.setLastSeenBlock(change.blockHeight, this.state.revert);
  }

  public revertTransactionFromState(change: IStateChange): void {
    if (this.corrupted) {
      this.logger.error(MorpheusStateHandler.CORRUPTED_ERR_MSG);
      return;
    }

    try {
      this.logger.debug(`revertTransactionFromState tx: ${change.transactionId}...`);
      this.logger.debug(`contains ${change.asset.operationAttempts.length} operations...`);
      this.setLastSeenBlock(change.blockHeight, this.state.revert);
      const confirmed = this.state.query.isConfirmed(change.transactionId);

      if (!confirmed.isPresent()) {
        throw new Error(`Transaction ${change.transactionId} was not confirmed, cannot revert.`);
      }

      if (confirmed.get()) {
        this.state.revert.confirmTx(change.transactionId);
        const revertVisitor = this.visitorPerformOperationAtHeight(change.blockHeight, this.state.revert, true);

        for (const operationData of change.asset.operationAttempts.slice().reverse()) {
          this.logger.debug(`Reverting operation ${operationData.operation}...`);
          const operation = Layer1.fromData(operationData);
          operation.accept(revertVisitor);
          this.logger.debug('Operation reverted');
        }
      } else {
        this.state.revert.rejectTx(change.transactionId);
      }

      for (const operationData of change.asset.operationAttempts.slice().reverse()) {
        this.logger.debug(`Reverting operation attempt ${operationData.operation}...`);
        const operation = Layer1.fromData(operationData);
        this.state.revert.registerOperationAttempt(change.blockHeight, change.transactionId, operation);
      }
    } catch (e) {
      this.logger.error(`${MorpheusStateHandler.CORRUPTED_ERR_MSG} Error: ${e}`);
      this.corrupted = true;
      this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
    }
  }

  private setLastSeenBlock(stateChangeHeight: number, state: IMorpheusOperations): void {
    try {
      state.setLastSeenBlockHeight(stateChangeHeight);
    } catch (error) {
      this.corrupted = true;
      this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
      throw error;
    }
  }

  private visitorPerformSignedOperationAtHeight(
    height: number,
    signerAuth: Authentication,
    state: IMorpheusOperations,
  ): ISignableOperationVisitor<void> {
    return {
      addKey: (did: Did, lastTxId: TransactionId | null, newAuth: Authentication, expiresAtHeight?: number): void => {
        state.addKey(height, signerAuth, did, lastTxId, newAuth, expiresAtHeight);
      },
      revokeKey: (did: Did, lastTxId: TransactionId | null, auth: Authentication): void => {
        state.revokeKey(height, signerAuth, did, lastTxId, auth);
      },
      addRight: (did: Did, lastTxId: TransactionId | null, auth: Authentication, right: Right): void => {
        state.addRight(height, signerAuth, did, lastTxId, auth, right);
      },
      revokeRight: (did: Did, lastTxId: TransactionId | null, auth: Authentication, right: Right): void => {
        state.revokeRight(height, signerAuth, did, lastTxId, auth, right);
      },
      tombstoneDid(did: Did, lastTxId: TransactionId | null): void {
        state.tombstoneDid(height, signerAuth, did, lastTxId);
      },
    };
  }

  private visitorPerformOperationAtHeight(height: number, state: IMorpheusOperations,
    reverse: boolean): IOperationVisitor<void> {
    return {
      signed: (operations: ISignedOperationsData): void => {
        const signableOperations = Layer1.Signed.getOperations(operations);
        const signerAuth = Crypto.authenticationFromData(operations.signerPublicKey);
        const performSignableAtHeight = this.visitorPerformSignedOperationAtHeight(height, signerAuth, state);

        for (const signable of reverse ? signableOperations.slice().reverse() : signableOperations) {
          this.logger.debug(`Applying signable operation ${signable.type}...`);
          signable.accept(performSignableAtHeight);
          this.logger.debug(`Signable operation ${signable.type} applied`);
        }
      },
      registerBeforeProof: (contentId: string): void => {
        state.registerBeforeProof(contentId, height);
      },
    };
  }
}
