import { Interfaces, SignedMessage } from "@internet-of-people/keyvault";
import { IOperationVisitor, OperationType, Operation, ISignedOperationsData, SignableOperation } from '../../interfaces';
import { fromSignableData } from './from-signable-data';
import { toBytes } from '../serde';

export class Signed extends Operation {
  public constructor(private readonly operations: ISignedOperationsData) {
    super();
  }

  public get type() { return OperationType.Signed; }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.signed(this.operations);
  }

  public static validateSignature(data: ISignedOperationsData, vault: Interfaces.IVault): SignableOperation[] {
    const signableBytes = toBytes(data.signables);
    const message = new SignedMessage(data.signerPublicKey, signableBytes, data.signature);
    if (!vault.validateSignature(message, data.signerDid)) {
      throw new Error('Invalid signature');
    }
    return data.signables.map(fromSignableData);
  }
}
