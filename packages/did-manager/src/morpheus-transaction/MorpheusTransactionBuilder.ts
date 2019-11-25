import { Transactions, Utils } from '@arkecosystem/crypto';
import { MorpheusTransaction } from './MorpheusTransaction';

export class MorpheusTransactionBuilder extends Transactions.TransactionBuilder<MorpheusTransactionBuilder> {
  constructor() {
    super();
    this.data.type = MorpheusTransaction.TYPE;
    this.data.typeGroup = MorpheusTransaction.TYPE_GROUP;
    this.data.version = 1; // TODO
    this.data.fee = MorpheusTransaction.FEE;
    this.data.amount = Utils.BigNumber.ZERO;
    this.data.asset = {};
    this.data.asset[MorpheusTransaction.ID] = {};
  }

  public beforeProof(contentId: string): MorpheusTransactionBuilder {
    this.data.asset![MorpheusTransaction.ID] = { contentId }; // TODO: this must not be good
    return this;
  }

  protected instance(): MorpheusTransactionBuilder {
    return this;
  }
}
