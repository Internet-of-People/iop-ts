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
              items: this.signedBundleSchema(),
            },
          },
          // additionalProperties: false,
        },
      },
    });
  }

  private static signedBundleSchema(): object {
    return {
      required: [ 'operations', 'nonce', 'publicKey', 'signature' ],
      properties: {
        operations: {
          type: 'array',
          items: {
            type: 'object',
            oneOf: [
              this.registerSchema(),
              this.updateSchema(),
              this.renewSchema(),
              this.transferSchema(),
              this.deleteSchema(),
            ],
          },
        },
        nonce: { type: 'number' },
        publicKey: { type: 'string' },
        signature: { type: 'string' },
      },
    };
  }

  private static registerSchema(): unknown {
    return {
      type: 'object',
      required: [ 'type', 'name', 'owner', 'subtreePolicies', 'registrationPolicy', 'data', 'expiresAtHeight' ],
      properties: {
        type: { type: 'string', const: 'register' },
        name: this.domainNameSchema(),
        owner: { type: 'string' },
        subtreePolicies: this.subtreePolicySchema(),
        registrationPolicy: { type: 'string', enum: [ 'any', 'owner' ] },
        data: this.domainData(),
        expiresAtHeight: { type: 'number' },
      },
    };
  }

  private static updateSchema(): unknown {
    return {
      type: 'object',
      required: [ 'type', 'name', 'data' ],
      properties: {
        type: { type: 'string', const: 'update' },
        name: this.domainNameSchema(),
        data: this.domainData(),
      },
    };
  }

  private static renewSchema(): unknown {
    return {
      type: 'object',
      required: [ 'type', 'name', 'expiresAtHeight' ],
      properties: {
        type: { type: 'string', const: 'renew' },
        name: this.domainNameSchema(),
        expiresAtHeight: { type: 'number' },
      },
    };
  }

  private static transferSchema(): unknown {
    return {
      type: 'object',
      required: [ 'type', 'name', 'toOwner' ],
      properties: {
        type: { type: 'string', const: 'transfer' },
        name: this.domainNameSchema(),
        toOwner: { type: 'string' },
      },
    };
  }

  private static deleteSchema(): unknown {
    return {
      type: 'object',
      required: [ 'type', 'name' ],
      properties: {
        type: { type: 'string', const: 'delete' },
        name: this.domainNameSchema(),
      },
    };
  }

  private static domainNameSchema(): unknown {
    return { type: 'string', pattern: '^(\\.[a-z0-9]+)+|\\.$' };
  }

  private static domainData(): unknown {
    return { type: [ 'object', 'array', 'string', 'number' ] };
  }

  private static subtreePolicySchema(): unknown {
    return {
      type: 'object',
      required: [],
      properties: {
        expiration: { type: 'number' },
        schema: { type: 'object' },
      },
    };
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
