import { Transactions, Utils } from '@arkecosystem/crypto';
import ByteBuffer from 'bytebuffer';

import { IMorpheusAsset, IMorpheusData } from '../interfaces';
import { operationSchemas } from './operations';
import { fromBuffer, toBuffer } from './serde';
const { schemas } = Transactions;

export class MorpheusTransaction extends Transactions.Transaction {
  public static readonly typeGroup: number = 4242;
  public static readonly type: number = 1;
  public static readonly key: string = 'morpheusTransaction';

  protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make(1e7);

  public data: IMorpheusData = {
    amount: Utils.BigNumber.make(0),
    asset: { operationAttempts: [] },
    fee: Utils.BigNumber.make(0),
    senderPublicKey: '',
    timestamp: 0,
    type: MorpheusTransaction.type,
  };

  /**
   * Returns a transaction's (a collection of operation attempts) schema, like:
   * {
   *  operationAttempts: [{
   *    operation: 'registerBeforeProof',
   *    contentId: 'my content id'
   *  },{
   *    operation: 'revokeBeforeProof',
   *    contentId: 'old content id'
   *  }]
   * }
   */
  public static getSchema(): Transactions.schemas.TransactionSchema {
    // noinspection TypeScriptValidateJSTypes
    return schemas.extend(schemas.transactionBaseSchema, {
      $id: this.key,
      required: [ 'asset', 'type', 'typeGroup' ],
      properties: {
        type: { transactionType: this.type },
        typeGroup: { const: this.typeGroup },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        asset: {
          required: ['operationAttempts'],
          additionalProperties: false,
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
    const data: IMorpheusAsset = this.data.asset;
    return toBuffer(data);
  }

  public deserialize(buffer: ByteBuffer): void {
    const data: IMorpheusAsset = fromBuffer(buffer);
    this.data.asset = data;
  }
}
