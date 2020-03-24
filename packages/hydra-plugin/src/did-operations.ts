import Optional from 'optional-js';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { IO } from '@internet-of-people/sdk';
type Did = IO.Did;
type TransactionId = IO.TransactionId;

const { Operations: { fromData, toSignableData, visitorFilterDid } } = MorpheusTransaction;


export interface IDidOperation {
  transactionId: TransactionId;
  blockHeight: number;
  data: Interfaces.ISignableOperationData;
  valid: boolean;
}


export interface ITransactionRepository {
  getMorpheusTransaction(txId: TransactionId): Promise<Optional<Interfaces.IMorpheusAsset>>;
}

export class DidOperationExtractor {
  public constructor(private readonly transactions: ITransactionRepository,
    private readonly stateHandler: Interfaces.IMorpheusStateHandler) {
  }

  public async didOperationsOf(
    did: Did,
    includeAttempts: boolean,
    fromHeightInc: number,
    untilHeightExc?: number,
  ): Promise<IDidOperation[]> {
    const transactionIdHeightsDesc = this.stateHandler.query.getDidTransactionIds(did,
      includeAttempts, fromHeightInc, untilHeightExc);
    const transactionIdHeightsAsc = transactionIdHeightsDesc.reverse();

    const resultAsc = new Array<IDidOperation>();

    for (const transactionIdHeight of transactionIdHeightsAsc) {
      const { transactionId } = transactionIdHeight;
      const morpheusTx = await this.transactions.getMorpheusTransaction(transactionId);
      const txOperations = morpheusTx
        .orElseThrow(() => {
          return new Error(`Implementation error: cached morpheus transaction ${transactionId} not found`);
        })
        .operationAttempts;

      const visitor = visitorFilterDid(did.toString());
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
      resultAsc.push(...didOperations);
    }
    return resultAsc.reverse();
  }
}
