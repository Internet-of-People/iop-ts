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
    asset: { bundles: [] },
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
          required: ['bundles'],
          // additionalProperties: false,
          properties: {
            bundles: {
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

    const frame = new ByteBuffer(bytes.length + 2, true);
    frame.writeVarint32(bytes.length);
    frame.append(bytes);

    return frame;
  }

  public deserialize(buffer: ByteBuffer): void {
    const frameLength = buffer.readVarint32();
    const frameBytes = buffer.readBytes(frameLength);

    const bytes: Uint8Array = Uint8Array.from(frameBytes.toBuffer());
    const ops = CoeusAsset.deserialize(bytes);
    this.data.asset = ops.toJson();
  }
}
