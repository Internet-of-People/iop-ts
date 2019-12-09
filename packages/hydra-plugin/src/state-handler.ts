import { Interfaces as KeyVaultInterfaces } from '@internet-of-people/key-vault';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { IAppLog } from './app-log';
import { MorpheusState } from './state';
import { IMorpheusOperations, IMorpheusQueries, IMorpheusState, MorpheusEvents } from './state-interfaces';

const { Operations: { fromData, Signed } } = MorpheusTransaction;

export interface IStateChange {
  asset: Interfaces.IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export const COMPONENT_NAME = 'morpheus-state-handler';

export interface IMorpheusStateHandler {
  readonly query: IMorpheusQueries;
  applyTransactionToState(stateChange: IStateChange): void;
  revertTransactionFromState(stateChange: IStateChange): void;
}

export class MorpheusStateHandler implements IMorpheusStateHandler {

  public get query(): IMorpheusQueries {
    if(this.corrupted) {
      throw new Error('Layer2 is corrupted.');
    }
    return this.state.query;
  }

  private atHeightSignable(height: number/*, signerAuth: Authentication*/, state: IMorpheusOperations): Interfaces.ISignableOperationVisitor<void> {
    return {
      addKey: (did: Interfaces.Did, auth: Interfaces.Authentication, expiresAtHeight?: number): void => {
        // TODO we must check somewhere if signer has update rights on did
        state.addKey(height, did, auth, expiresAtHeight);
      },
    };
  }

  private atHeight(height: number, state: IMorpheusOperations): Interfaces.IOperationVisitor<void> {
    return {
      signed: (operations: Interfaces.ISignedOperationsData/*, signerAuth: Authentication*/): void => {
        // TODO validateSignature is a wrong name for a "getter"
        const signableOperations = Signed.validateSignature(operations, this.vault);
        const atHeightSignable = this.atHeightSignable(height/*, signerAuth*/, state);
        for (const signable of signableOperations) {
          this.logger.debug(`Applying signable operation ${signable.operation}...`);
          signable.accept(atHeightSignable);
          this.logger.debug('Operation applied');
        }
      },
      registerBeforeProof:(contentId: string): void => {
        state.registerBeforeProof(contentId, height);
      },
      revokeBeforeProof: (contentId: string): void => {
        state.revokeBeforeProof(contentId, height);
      },
    };
  }

  private state: IMorpheusState = new MorpheusState();
  private corrupted: boolean = false;

  public constructor(
    private readonly logger: IAppLog,
    private readonly eventEmitter: NodeJS.EventEmitter,
    private readonly vault: KeyVaultInterfaces.IVault) {
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    if(this.corrupted) {
      this.logger.error('State is corrupted, not accepting applys anymore');
      return;
    }

    try {
      this.logger.debug(`applyTransactionToState tx: ${stateChange.transactionId}, contains ${stateChange.asset.operationAttempts.length} operations...`);
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
    if(this.corrupted) {
      this.logger.error('State is corrupted, not accepting applys anymore');
      return;
    }

    try {
      this.logger.debug(`revertTransactionFromState tx: ${stateChange.transactionId}, contains ${stateChange.asset.operationAttempts.length} operations...`);
      const confirmed = this.state.query.isConfirmed(stateChange.transactionId);
      if(!confirmed.isPresent()) {
        throw new Error(`Transaction ${stateChange.transactionId} was not confirmed, cannot revert.`);
      }
      if(!confirmed.get()) {
        this.state.revert.rejectTx(stateChange.transactionId);
      }
      else {
        this.state.revert.confirmTx(stateChange.transactionId);

        const revert = this.atHeight(stateChange.blockHeight, this.state.revert);
        for (const operationData of stateChange.asset.operationAttempts) {
          this.logger.debug(`Reverting operation ${operationData.operation}...`);
          const operation = fromData(operationData);
          operation.accept(revert);
          this.logger.debug('Operation reverted');
        }
      }
    } catch (e) {
      this.logger.error(`Layer 2 state is corrupt. All incoming transaction will be ignored. Error: ${e}`);
      this.corrupted = true;
      this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
    }
  }
}
