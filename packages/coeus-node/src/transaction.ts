import ByteBuffer from 'bytebuffer';
import { Transactions, Utils } from '@arkecosystem/crypto';
import { ICoeusData } from '@internet-of-people/coeus-proto';

export class CoeusTransaction extends Transactions.Transaction {
  public static readonly typeGroup: number = 4242;
  public static readonly type: number = 2;
  public static readonly key: string = 'coeusTransaction';

  protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make(1e7);

  public data: ICoeusData = {
    amount: Utils.BigNumber.make(0),
    asset: { operationAttempts: null }, // TODO
    fee: Utils.BigNumber.make(0),
    senderPublicKey: '',
    timestamp: 0,
    type: CoeusTransaction.type,
  };

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
                // anyOf: operationSchemas(), TODO
              },
            },
          },
        },
      },
    });
  }

  public serialize(): ByteBuffer {
    // TODO
    return ByteBuffer.fromHex('');
  }

  public deserialize(_: ByteBuffer): void {
    // TODO
  }
}
