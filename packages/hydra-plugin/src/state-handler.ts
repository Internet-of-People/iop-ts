import {Database} from "@arkecosystem/core-interfaces";
import { Interfaces as CryptoIf } from "@arkecosystem/crypto";
import {Interfaces, MorpheusTransaction} from "@internet-of-people/did-manager";
import {IMorpheusState, MorpheusState} from "./MorpheusState";
const { Operations: { Types } } = MorpheusTransaction;

export class MorpheusStateHandler {
  public static instance(): IMorpheusState {
    if(!this.state){
      this.state = new MorpheusState();
    }

    return this.state;
  }

  public static applyTransactionToState(transaction: Database.IBootstrapTransaction|CryptoIf.ITransactionData, state: IMorpheusState): void {
    const asset = transaction.asset as Interfaces.IMorpheusAsset;
    for (const operation of asset.operationAttempts) {
      switch (operation.operation) {
        case Types.OperationType.RegisterBeforeProof:
          // state.apply.registerBeforeProof()
          // TODO: typings (IMorpheusAsset) is not good here I think.
          // asset must has a structure like: {operationAttempts: [{operation: "registerBeforeProof": params: {contentId: "id"}}]},
          break;
        case Types.OperationType.RevokeBeforeProof:
          break;
        default:
          throw new Error(`Unknow operation type '${operation.operation}' at height ${transaction.blockId}. TX: ${JSON.stringify(transaction)}`);
      }
    }
  }

  private static state: IMorpheusState|undefined;
}
