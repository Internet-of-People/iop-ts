import { Authentication, Did, IAddKeyData, ISignableOperationData, ISignableOperationVisitor, SignableOperation, SignableOperationType } from '../../interfaces';

class ToSignableDataVisitor implements ISignableOperationVisitor<ISignableOperationData> {
  public addKey(did: Did, auth: Authentication, expiresAtHeight?: number): ISignableOperationData {
    const result: IAddKeyData = {
      operation: SignableOperationType.AddKey,
      did,
      auth: auth.toString(),
    };
    if (expiresAtHeight) {
      result.expiresAtHeight = expiresAtHeight;
    }
    return result;
  }
}

export const toSignableData = (operation: SignableOperation): ISignableOperationData => {
  return operation.accept(new ToSignableDataVisitor());
};
