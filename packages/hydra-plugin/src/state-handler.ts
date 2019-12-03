import {Interfaces, MorpheusTransaction} from "@internet-of-people/did-manager";
import {IAppLog} from "./app-log";
import {IMorpheusQueries, IMorpheusState, MorpheusState} from "./state";
const { Operations: { fromData } } = MorpheusTransaction;

export interface IStateChange {
  asset: Interfaces.IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export class MorpheusStateHandler {
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

  public logger: IAppLog | undefined;
  private state: IMorpheusState;

  private constructor() {
    this.state = new MorpheusState();
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    const newState = this.state.clone();

    try {
      for (const operationData of stateChange.asset.operationAttempts) {
        const operation = fromData(operationData);
        operation.accept(this.apply(stateChange.blockHeight));
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

        for (const operationData of stateChange.asset.operationAttempts) {
          const operation = fromData(operationData);
          operation.accept(this.revert(stateChange.blockHeight));
        }
      }
    } catch(e) {
      this.logger!.error(`Layer 2 state is corrupt. Error: ${e.message}`);
      // TODO: mark whole layer 2 state as corrupt: no new changes are accepted; no queries are served
    }
  }

  public query(): IMorpheusQueries {
    return this.state.query;
  }

  private apply(height: number): Interfaces.IOperationVisitor<void> {
    return {
      registerBeforeProof:(contentId: string): void => {
        this.state.apply.registerBeforeProof(contentId, height);
      },
      revokeBeforeProof: (contentId: string): void => {
        this.state.apply.revokeBeforeProof(contentId, height);
      }
    };
  }

  private revert(height: number): Interfaces.IOperationVisitor<void> {
    return {
      registerBeforeProof:(contentId: string): void => {
        this.state.revert.registerBeforeProof(contentId, height);
      },
      revokeBeforeProof: (contentId: string): void => {
        this.state.revert.revokeBeforeProof(contentId, height);
      }
    };
  }
}
