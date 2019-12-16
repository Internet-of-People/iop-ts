import {
  Authentication,
  Did,
  IAddKeyData,
  IAddRightData, IRevokeKeyData, IRevokeRightData,
  ISignableOperationData,
  ISignableOperationVisitor,
  Right,
  SignableOperation,
  SignableOperationType,
} from '../../interfaces';

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

  public revokeKey(did: Did, auth: Authentication): ISignableOperationData {
    const result: IRevokeKeyData = {
      operation: SignableOperationType.RevokeKey,
      did,
      auth: auth.toString(),
    };
    return result;
  }

  public addRight(did: Did, auth: Authentication, right: Right): ISignableOperationData {
    const result: IAddRightData = {
      operation: SignableOperationType.AddRight,
      did,
      auth: auth.toString(),
      right,
    };
    return result;
  }

  public revokeRight(did: Did, auth: Authentication, right: Right): ISignableOperationData {
    const result: IRevokeRightData = {
      operation: SignableOperationType.RevokeRight,
      did,
      auth: auth.toString(),
      right,
    };
    return result;
  }
}

export const toSignableData = (operation: SignableOperation): ISignableOperationData => {
  return operation.accept(new ToSignableDataVisitor());
};
