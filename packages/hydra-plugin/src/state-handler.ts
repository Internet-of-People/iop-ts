import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { IAppLog } from "./app-log";
import { MorpheusState } from "./state";
import { IMorpheusOperations, IMorpheusQueries, IMorpheusState } from "./state-interfaces";
const { Operations: { fromData } } = MorpheusTransaction;

export interface IStateChange {
  asset: Interfaces.IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export class MorpheusStateHandler {
  public get query(): IMorpheusQueries {
    if(this.isCorrupted()) {
      throw new Error('Layer2 is corrupted.');
    }
    return this.state.query;
  }

  public static reset(): void {
    this.handler = undefined;
  }

  public static instance(): MorpheusStateHandler {
    if (!this.handler) {
      this.handler = new MorpheusStateHandler();
    }
    return this.handler;
  }

  private static handler: MorpheusStateHandler | undefined;

  private static atHeight(height: number, ops: IMorpheusOperations): Interfaces.IOperationVisitor<void> {
    return {
      registerBeforeProof:(contentId: string): void => {
        ops.registerBeforeProof(contentId, height);
      },
      revokeBeforeProof: (contentId: string): void => {
        ops.revokeBeforeProof(contentId, height);
      }
    };
  }

  public logger: IAppLog | undefined;
  private state: IMorpheusState;
  private corrupted: boolean = false;

  private constructor() {
    this.state = new MorpheusState();
  }

  public isCorrupted(): boolean {
    return this.corrupted;
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    try {
      const newState = this.state.clone();
      const apply = MorpheusStateHandler.atHeight(stateChange.blockHeight, newState.apply);
      for (const operationData of stateChange.asset.operationAttempts) {
        const operation = fromData(operationData);
        operation.accept(apply);
      }
      newState.apply.confirmTx(stateChange.transactionId);
      this.state = newState;
    } catch(e){
      this.logger!.info(`Transaction could not be applied. Error: ${e.message}, TX: ${JSON.stringify(stateChange)}`);
      this.state.apply.rejectTx(stateChange.transactionId);
    }
  }

  public revertTransactionFromState(stateChange: IStateChange): void {
    try {
      const confirmed = this.state.query.isConfirmed(stateChange.transactionId);
      if(!confirmed.isPresent()) {
        throw new Error(`Transaction ${stateChange.transactionId} was not confirmed, cannot revert.`);
      }
      if(!confirmed.get()) {
        this.state.revert.rejectTx(stateChange.transactionId);
      }
      else {
        this.state.revert.confirmTx(stateChange.transactionId);

        const revert = MorpheusStateHandler.atHeight(stateChange.blockHeight, this.state.revert);
        for (const operationData of stateChange.asset.operationAttempts) {
          const operation = fromData(operationData);
          operation.accept(revert);
        }
      }
    } catch(e) {
      this.logger!.error(`Layer 2 state is corrupt. All incoming transaction will be ignored. Error: ${e.message}`);
      this.corrupted = true;
    }
  }
}
