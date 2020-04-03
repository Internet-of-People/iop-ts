import { Transactions, Utils } from '@arkecosystem/crypto';
import ByteBuffer from 'bytebuffer';

import * as Layer1 from '../types/layer1';
import { operationSchemas } from './schemas';
import { fromBuffer, toBuffer } from './serde';

export class MorpheusTransaction extends Transactions.Transaction {
  public static readonly typeGroup: number = 4242;
  public static readonly type: number = 1;
  public static readonly key: string = 'morpheusTransaction';

  protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make(1e7);

  public data: Layer1.IMorpheusData = {
    amount: Utils.BigNumber.make(0),
    asset: { operationAttempts: [] },
    fee: Utils.BigNumber.make(0),
    senderPublicKey: '',
    timestamp: 0,
    type: MorpheusTransaction.type,
  };

  /**
   * Returns the schema of the Morpheus transaction. The asset consists of a collection of operation attempts.
   */
  public static getSchema(): Transactions.schemas.TransactionSchema {
    // noinspection TypeScriptValidateJSTypes
    return Transactions.schemas.extend(Transactions.schemas.transactionBaseSchema, {
      $id: this.key,
      required: [ 'asset', 'type', 'typeGroup' ],
      properties: {
        type: { transactionType: this.type },
        typeGroup: { const: this.typeGroup },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        asset: {
          required: ['operationAttempts'],
          // additionalProperties: false,
          properties: {
            operationAttempts: {
              type: 'array',
              items: {
                anyOf: operationSchemas(),
              },
            },
          },
        },
      },
    });
  }

  public serialize(): ByteBuffer {
    const data: Layer1.IMorpheusAsset = this.data.asset;
    return toBuffer(data);
  }

  public deserialize(buffer: ByteBuffer): void {
    const data: Layer1.IMorpheusAsset = fromBuffer(buffer);
    this.data.asset = data;
  }
}
