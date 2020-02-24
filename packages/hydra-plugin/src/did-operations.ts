import Optional from 'optional-js';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';

const { Operations: { fromData, toSignableData, visitorFilterDid } } = MorpheusTransaction;


export interface IDidOperation {
  transactionId: Interfaces.TransactionId;
  blockHeight: number;
  data: Interfaces.ISignableOperationData;
  valid: boolean;
}


export interface ITransactionRepository {
  getMorpheusTransaction(txId: Interfaces.TransactionId): Promise<Optional<Interfaces.IMorpheusAsset>>;
}

export class DidOperationExtractor {
  public constructor(private readonly transactions: ITransactionRepository,
    private readonly stateHandler: Interfaces.IMorpheusStateHandler) {
  }

  public async didOperationsOf(
    did: Interfaces.Did,
    includeAttempts: boolean,
    fromHeightInc: number,
    untilHeightExc?: number,
  ): Promise<IDidOperation[]> {
    const transactionIdHeights = this.stateHandler.query.getDidTransactionIds(did,
      includeAttempts, fromHeightInc, untilHeightExc);

    const result = new Array<IDidOperation>();

    for (const transactionIdHeight of transactionIdHeights) {
      const { transactionId } = transactionIdHeight;
      const morpheusTx = await this.transactions.getMorpheusTransaction(transactionId);
      const txOperations = morpheusTx
        .orElseThrow(() => {
          return new Error(`Implementation error: cached morpheus transaction ${transactionId} not found`);
        })
        .operationAttempts;

      const visitor = visitorFilterDid(did);
      const signedOperationsHierarchy = txOperations.map((item) => {
        return fromData(item).accept(visitor);
      });
      const signedOpsFlattened = new Array<Interfaces.SignableOperation>().concat(...signedOperationsHierarchy);
      const didOperations: IDidOperation[] = signedOpsFlattened.map((attempt) => {
        return {
          transactionId,
          blockHeight: transactionIdHeight.height,
          data: toSignableData(attempt),
          valid: this.stateHandler.query.isConfirmed(transactionId).orElse(false),
        };
      });
      result.push(...didOperations);
    }
    return result;
  }
}
