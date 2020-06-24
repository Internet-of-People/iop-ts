import { PublicKey, Signature, SignedBytes, stringifyJson } from '@internet-of-people/morpheus-crypto';
import {
  IOperationVisitor,
  ISignedOperationsData,
  ISignableOperationData,
} from '../../types/layer1';
import { Operation, SignableOperation } from '../operation';
import { OperationType } from '../operation-type';
import { toBuffer } from '../serde';
import { fromSignableData } from './from-data';

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
    const signedBytes = new SignedBytes(
      new PublicKey(data.signerPublicKey),
      signableBytes,
      new Signature(data.signature),
    );

    if (!signedBytes.validate()) {
      throw new Error('Invalid signature');
    }
    return Signed.getOperationsUnsafeWithoutSignatureChecking(data);
  }

  public static serialize(ops: ISignableOperationData[]): Uint8Array {
    // Note: stringify is required here to keep the JSON serialization strict in order
    const buffer = toBuffer(JSON.parse(stringifyJson(ops)));

    buffer.flip();
    const bytes = Uint8Array.from(buffer.toBuffer());
    return bytes;
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.signed(this.operations);
  }
}
