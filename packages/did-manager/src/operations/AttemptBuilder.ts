// import { P2P, TransactionPool } from "@arkecosystem/core-interfaces";
// import { Transactions, Utils } from "@arkecosystem/crypto";
import { IAddKeyOperationParam, IOperation } from './interfaces';
import { OperationType } from './OperationType';

export class AttemptBuilder {
  public static addKey(
    multiCipher: string,
    controllerDid?: string
  ): IOperation<IAddKeyOperationParam> {
  

    return {
      operation: OperationType.AddKey,
      params: {
        multiCipher,
        controllerDid
      }
    };
  }
}