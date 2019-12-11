import { SignedMessage, validateSignature } from '@internet-of-people/keyvault';
import { IOperationVisitor, ISignedOperationsData, Operation, OperationType, SignableOperation } from '../../interfaces';
import { toBytes } from '../serde';
import { fromSignableData } from './from-signable-data';

export class Signed extends Operation {

  public get type() { return OperationType.Signed; }

  public static getAuthenticatedOperations(data: ISignedOperationsData): SignableOperation[] {
    const signableBytes = toBytes(data.signables);
    const message = new SignedMessage(data.signerPublicKey, signableBytes, data.signature);
    if (!validateSignature(message, data.signerDid)) {
      throw new Error('Invalid signature');
    }
    return data.signables.map(fromSignableData);
  }
  public constructor(private readonly operations: ISignedOperationsData) {
    super();
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.signed(this.operations);
  }
}
