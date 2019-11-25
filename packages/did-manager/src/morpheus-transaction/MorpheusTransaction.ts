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
  public static readonly TYPE_GROUP: number = 42;
  public static readonly TYPE: number = 1;
  public static readonly FEE: Utils.BigNumber = Utils.BigNumber.make('5000000000'); // TODO

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
        type: { transactionType: this.TYPE, },
        typeGroup: { const: this.TYPE_GROUP, },
        amount: { bignumber: { minimum: 0, maximum: 0 } }, // TODO
        asset: {
          type: 'object',
          required: [ this.ID ],
          properties: {
            required: ['operationAttempts'],
            transactions: {
              type: 'array',
              items: {
                anyOf: [
                  registerBeforeProofSchema,
                ]
              }
            }
          }
        },
      },
    });
  }

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
    const buffer = new ByteBuffer(jsonSer.length);
    buffer.writeString(jsonSer);
    return buffer;
  }

  public deserialize(buffer: ByteBuffer): void {
    let morpheusData: IMorpheusAsset;
    const json = buffer.readString(buffer.capacity());
    morpheusData = JSON.parse(json as string);
    this.data.asset = {
      morpheusData,
    };
  }
}
