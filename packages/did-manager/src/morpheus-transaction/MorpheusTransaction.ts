import { Transactions, Utils } from '@arkecosystem/crypto';
import { registerBeforeProofSchema } from './operationSchemas';
import { IMorpheusAsset } from './IMorpheusAsset';
const { schemas } = Transactions;

export class MorpheusTransaction extends Transactions.Transaction {
  public static readonly ID: string = 'morpheusData';
  public static readonly TYPE_GROUP: number = 42;
  public static readonly TYPE: number = 1;
  public static readonly KEY: string = 'morpheus_key';
  public static readonly FEE: Utils.BigNumber = Utils.BigNumber.make('5000000000'); // TODO

  /**
   * Returns a transaction (a collection of operations) schema, like:
   * {
   *  transactions: [{
   *    operation: 'registerBeforeProof',
   *    params: {
   *      contentId: 'my content id'
   *    }
   *  }]
   * }
   */
  public static getSchema(): Transactions.schemas.TransactionSchema {
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

  public serialize(): ByteBuffer {
    //const x = this.data.asset!.morpheusData as IMorpheusAsset;
    throw new Error("Method not implemented.");
  }  
  
  public deserialize(buffer: any): void {
    throw new Error("Method not implemented.");
  }
}