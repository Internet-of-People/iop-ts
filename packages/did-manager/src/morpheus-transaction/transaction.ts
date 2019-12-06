import { Transactions, Utils } from '@arkecosystem/crypto';
import ByteBuffer from 'bytebuffer';

import { IMorpheusAsset, IMorpheusData } from '../interfaces';
import { operationSchemas } from './operations';
const { schemas } = Transactions;

export class MorpheusTransaction extends Transactions.Transaction {
  public static readonly typeGroup: number = 4242;
  public static readonly type: number = 1;
  public static readonly key: string = 'morpheusTransaction';

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
      required: ['asset','type','typeGroup'],
      properties: {
        type: { transactionType: this.type, },
        typeGroup: { const: this.typeGroup, },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        asset: {
          type: 'object',
          required: ['operationAttempts'],
          additionalProperties: false,
          properties: {
            operationAttempts: {
              type: 'array',
              items: {
                anyOf: operationSchemas()
              }
            }
          }
        },
      },
    });
  }
  protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make(1e7);

  public data: IMorpheusData = {
    amount: Utils.BigNumber.make(0),
    asset: { operationAttempts: [] },
    fee: Utils.BigNumber.make(0),
    senderPublicKey: '',
    timestamp: 0,
    type: MorpheusTransaction.type
  };

  public serialize(): ByteBuffer {
    const data: IMorpheusAsset = this.data.asset;
    const jsonSer = JSON.stringify(data);
    const jsonBytes = Buffer.from(jsonSer, 'utf8');
    const buffer = new ByteBuffer(jsonBytes.length+1, true);
    // TODO: serialize data using msgpack instead of just putting json in it
    buffer.writeUint8(jsonBytes.length);
    buffer.append(jsonBytes, 'hex');
    return buffer;
  }

  public deserialize(buffer: ByteBuffer): void {
    const length = buffer.readUint8();
    const data = buffer.readString(length);
    const morpheusData = JSON.parse(data) as unknown as IMorpheusAsset;
    this.data.asset = morpheusData;
  }
}
