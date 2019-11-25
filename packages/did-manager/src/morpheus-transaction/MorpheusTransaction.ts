import { Interfaces as Crypto, Transactions, Utils } from '@arkecosystem/crypto';
import ByteBuffer from 'bytebuffer';
import { IMorpheusAsset } from './IMorpheusAsset';
import { registerBeforeProofSchema } from './operationSchemas';
const { schemas } = Transactions;

export interface IMorpheusData extends Crypto.ITransactionData {
  asset: Crypto.ITransactionAsset;
}

export class MorpheusTransaction extends Transactions.Transaction {
  public static readonly ID: string = 'morpheusData';
  public static readonly typeGroup: number = 4242;
  public static readonly type: number = 1;
  public static readonly key: string = 'morpheusTransaction';

  /**
   * Returns a transaction's (a collection of operation attempts) schema, like:
   * {
   *  operationAttempts: [{
   *    operation: 'registerBeforeProof',
   *    params: {
   *      contentId: 'my content id'
   *    }
   *  }]
   * }
   */
  public static getSchema(): Transactions.schemas.TransactionSchema {
    // noinspection TypeScriptValidateJSTypes
    return schemas.extend(schemas.transactionBaseSchema, {
      $id: this.ID,
      required: ['asset','type','typeGroup'],
      properties: {
        type: { transactionType: this.type, },
        typeGroup: { const: this.typeGroup, },
        amount: { bignumber: { minimum: 0, maximum: 0 } },
        asset: {
          type: 'object',
          required: [ 'morpheusData' ],
          properties: {
            morpheusData: {
              type: 'object',
              required: ['operationAttempts'],
              properties: {
                operationAttempts: {
                  type: 'array',
                  items: {
                    anyOf: [ registerBeforeProofSchema ]
                  }
                }
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
    asset: {},
    fee: Utils.BigNumber.make(0),
    senderPublicKey: "",
    timestamp: 0,
    type: 0
  };

  public serialize(): ByteBuffer {
    const data = this.data.asset!.morpheusData as IMorpheusAsset;
    const jsonSer = JSON.stringify(data);
    const jsonBytes = Buffer.from(jsonSer, 'utf8');
    const buffer = new ByteBuffer(jsonBytes.length+1, true);
    // TODO: serialize data using msgpack instead of just putting json in it
    buffer.writeUint8(jsonBytes.length);
    buffer.append(jsonBytes, 'hex');
    return buffer;
  }

  public deserialize(buffer: ByteBuffer): void {
    let morpheusData: IMorpheusAsset;
    const length = buffer.readUint8();
    const data = buffer.readString(length);
    morpheusData = JSON.parse(data);
    this.data.asset = {
      morpheusData,
    };
  }
}
