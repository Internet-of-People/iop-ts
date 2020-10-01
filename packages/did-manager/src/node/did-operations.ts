import Optional from 'optional-js';
import { Layer1, Crypto, Types } from '@internet-of-people/sdk';
import { IMorpheusStateHandler } from '../interfaces/morpheus';
import { visitorFilterDid } from '../morpheus-transaction/operations/filter-did';

export interface ITransactionRepository {
  getMorpheusTransaction(txId: Types.Sdk.TransactionId): Promise<Optional<Types.Layer1.IMorpheusAsset>>;
}

export class DidOperationExtractor {
  public constructor(
    private readonly transactions: ITransactionRepository,
    private readonly stateHandler: IMorpheusStateHandler,
  ) {}

  public async didOperationsOf(
    did: Crypto.Did,
    includeAttempts: boolean,
    fromHeightInc: number,
    untilHeightInc?: number,
  ): Promise<Types.Layer2.IDidOperation[]> {
    const transactionIdHeightsDesc = this.stateHandler.query.getDidTransactionIds(did,
      includeAttempts, fromHeightInc, untilHeightInc);
    const transactionIdHeightsAsc = transactionIdHeightsDesc.reverse();

    const resultAsc = new Array<Types.Layer2.IDidOperation>();

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
        return Layer1.fromData(item).accept(visitor);
      });
      const signedOpsFlattened = new Array<Layer1.SignableOperation>().concat(...signedOperationsHierarchy);
      const didOperations: Types.Layer2.IDidOperation[] = signedOpsFlattened.map((attempt) => {
        return {
          transactionId,
          blockHeight: transactionIdHeight.height,
          data: Layer1.toSignableData(attempt),
          valid: this.stateHandler.query.isConfirmed(transactionId).orElse(false),
        };
      });
      resultAsc.push(...didOperations);
    }
    return resultAsc.reverse();
  }
}
