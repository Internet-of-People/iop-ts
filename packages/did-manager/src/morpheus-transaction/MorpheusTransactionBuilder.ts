import { Interfaces, Transactions, Utils } from '@arkecosystem/crypto';
import { MorpheusTransaction } from './MorpheusTransaction';
import { OperationAttemptsBuilder } from "./OperationAttemptsBuilder";

export class MorpheusTransactionBuilder extends Transactions.TransactionBuilder<MorpheusTransactionBuilder> {
  // see minFeePool: https://github.com/Internet-of-People/hydra-core/blob/master/packages/core/bin/config/mainnet/plugins.js
  private static readonly FLAKES_PER_BYTES = 3000;
  private static readonly OFFSET_BYTES = 3000; // we suppose one transaction eats up ~80Byte

  /**
   * Read more here:
   * https://blog.ark.io/towards-flexible-marketplace-with-ark-dynamic-fees-running-on-new-core-31f1aaf1e867
   * @param attempts
   */
  private static calculateFee(attempts: OperationAttemptsBuilder): Utils.BigNumber {
    const txLength = JSON.stringify(attempts.getAttempts()).length;
    return Utils.BigNumber.make(this.OFFSET_BYTES).plus(txLength).times(this.FLAKES_PER_BYTES)
  }

  constructor() {
    super();
    this.data.type = MorpheusTransaction.type;
    this.data.typeGroup = MorpheusTransaction.typeGroup;
    this.data.version = 2;
    this.data.amount = Utils.BigNumber.ZERO;
    this.data.asset = {};
    this.data.asset[MorpheusTransaction.ID] = {};
  }

  public fromOperationAttempts(attemptsBuilder: OperationAttemptsBuilder): MorpheusTransactionBuilder {
    this.data.asset![MorpheusTransaction.ID] = {
      operationAttempts: attemptsBuilder.getAttempts(),
    };
    this.data.fee = MorpheusTransactionBuilder.calculateFee(attemptsBuilder);
    return this;
  }

  public getStruct(): Interfaces.ITransactionData {
    const struct: Interfaces.ITransactionData = super.getStruct();
    struct.amount = this.data.amount;
    struct.asset = this.data.asset;
    return struct;
  }

  protected instance(): MorpheusTransactionBuilder {
    return this;
  }
}
