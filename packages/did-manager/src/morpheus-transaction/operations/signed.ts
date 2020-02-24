import { PublicKey, Signature, SignedMessage } from '@internet-of-people/keyvault';
import stringify from 'json-stable-stringify';
import {
  IOperationVisitor,
  ISignedOperationsData,
  Operation,
  OperationType,
  SignableOperation,
  ISignableOperationData,
} from '../../interfaces';
import { fromSignableData } from './from-signable-data';
import { toBuffer } from '../serde';

export class Signed extends Operation {
  public get type(): OperationType {
    return OperationType.Signed;
  }

  public constructor(private readonly operations: ISignedOperationsData) {
    super();
  }

  public static getOperationsUnsafeWithoutSignatureChecking(data: ISignedOperationsData): SignableOperation[] {
    return data.signables.map(fromSignableData);
  }

  public static getOperations(data: ISignedOperationsData): SignableOperation[] {
    const signableBytes = Signed.serialize(data.signables);
    const message = new SignedMessage(new PublicKey(data.signerPublicKey),
      signableBytes, new Signature(data.signature));

    if (!message.validate()) {
      throw new Error('Invalid signature');
    }
    return Signed.getOperationsUnsafeWithoutSignatureChecking(data);
  }

  public static serialize(ops: ISignableOperationData[]): Uint8Array {
    const buffer = toBuffer(stringify(ops));
    buffer.flip();
    const bytes = Uint8Array.from(buffer.toBuffer());
    return bytes;
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.signed(this.operations);
  }
}
