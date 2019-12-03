import {Interfaces, MorpheusTransaction} from "@internet-of-people/did-manager";
import {IAppLog} from "./app-log";
import {IMorpheusOperations, IMorpheusQueries, IMorpheusState, MorpheusState} from "./state";
const { Operations: { fromData } } = MorpheusTransaction;

export interface IStateChange {
  asset: Interfaces.IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export class MorpheusStateHandler {
  public get query(): IMorpheusQueries {
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

  private constructor() {
    this.state = new MorpheusState();
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    const newState = this.state.clone();

    try {
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
      this.logger!.error(`Layer 2 state is corrupt. Error: ${e.message}`);
      // TODO: mark whole layer 2 state as corrupt: no new changes are accepted; no queries are served
    }
  }
}
