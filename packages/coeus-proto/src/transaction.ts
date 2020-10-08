import ByteBuffer from 'bytebuffer';
import { Transactions, Utils } from '@arkecosystem/crypto';
import { CoeusAsset } from '@internet-of-people/sdk-wasm';
import { ICoeusData } from './asset';

export class CoeusTransaction extends Transactions.Transaction {
  public static readonly typeGroup: number = 4242;
  public static readonly type: number = 2;
  public static readonly key: string = 'coeusTransaction';

  protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make(1e7);

  public data: ICoeusData = {
    amount: Utils.BigNumber.make(0),
    asset: { signedOperations: [] },
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
          required: ['signedOperations'],
          // additionalProperties: false,
          properties: {
            signedOperations: {
              type: 'array',
              items: { type: 'object' }, // TODO
            },
          },
        },
      },
    });
  }

  public serialize(): ByteBuffer {
    const ops = new CoeusAsset(this.data.asset);
    const bytes: Uint8Array = ops.serialize();
    
    const buffer = new ByteBuffer(bytes.length + 2, true);
    buffer.append(bytes);

    return buffer;
  }

  public deserialize(buffer: ByteBuffer): void {
    const length = buffer.readVarint32();
    const jsonSer = buffer.readString(length);

    const fixedBuffer = new ByteBuffer(length + 2, true);
    fixedBuffer.writeVarint32(length);
    fixedBuffer.append(Buffer.from(jsonSer, 'utf8'));

    const bytes: Uint8Array = Uint8Array.from(fixedBuffer.buffer);
    const ops = CoeusAsset.deserialize(bytes);
    this.data.asset = ops.toJson();
  }
}
