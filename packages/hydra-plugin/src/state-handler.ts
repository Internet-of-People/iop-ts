import {Interfaces, MorpheusTransaction} from "@internet-of-people/did-manager";
import cloneDeep from "lodash.clonedeep";
import {IAppLog} from "./app-log";
import {IMorpheusState, MorpheusState} from "./state";
const { Operations: { fromData } } = MorpheusTransaction;

export interface IStateChange {
  asset: Interfaces.IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export class MorpheusStateHandler {
  public static instance(): MorpheusStateHandler {
    if(!this.handler) {
      this.handler = new MorpheusStateHandler();
    }

    return this.handler;
  }

  private static handler: MorpheusStateHandler;
  public logger: IAppLog|undefined;
  private state: IMorpheusState;
  private constructor() {
    this.state = new MorpheusState();
  }

  public applyTransactionToState(stateChange: IStateChange): void {
    const newState = cloneDeep(this.state);

    try {
      for (const operationData of stateChange.asset.operationAttempts) {
        const operation = fromData(operationData);
        operation.accept(this.apply(stateChange.blockHeight));
      }
      newState.apply.confirmTx(stateChange.transactionId);
      this.state = newState;
    } catch(e){
      this.logger!.info(`Transaction could not be applied. Error: ${e.message}, TX: ${JSON.stringify(stateChange)}`);
    }
  }

  public revertTransactionFromState(stateChange: IStateChange): void {
    try {
      if(!this.state.query.isConfirmed(stateChange.transactionId)) {
        throw new Error(`Transaction ${stateChange.transactionId} was not confirmed, cannot revert.`);
      }
      for (const operationData of stateChange.asset.operationAttempts) {
        const operation = fromData(operationData);
        operation.accept(this.revert(stateChange.blockHeight));
      }

      this.state.revert.confirmTx(stateChange.transactionId);
    } catch(e) {
      this.logger!.error(`Layer 2 state is corrupt. Error: ${e.message}`);
      // TODO: mark whole layer 2 state as corrupt: no new changes are accepted; no queries are served
    }
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
