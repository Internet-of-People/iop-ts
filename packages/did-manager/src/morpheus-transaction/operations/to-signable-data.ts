import {
  Authentication,
  Did,
  IAddKeyData,
  IAddRightData, IRevokeKeyData, IRevokeRightData,
  ISignableOperationData,
  ISignableOperationVisitor, ITombstoneDidData,
  Right,
  SignableOperation,
  SignableOperationType,
  TransactionId,
} from '../../interfaces';

class ToSignableDataVisitor implements ISignableOperationVisitor<ISignableOperationData> {
  public addKey(
    did: Did,
    lastTxId: TransactionId,
    auth: Authentication,
    expiresAtHeight?: number,
  ): ISignableOperationData {
    const result: IAddKeyData = {
      operation: SignableOperationType.AddKey,
      did,
      lastTxId,
      auth: auth.toString(),
    };

    if (expiresAtHeight) {
      result.expiresAtHeight = expiresAtHeight;
    }
    return result;
  }

  public revokeKey(
    did: Did,
    lastTxId: TransactionId,
    auth: Authentication,
  ): ISignableOperationData {
    const result: IRevokeKeyData = {
      operation: SignableOperationType.RevokeKey,
      did,
      lastTxId,
      auth: auth.toString(),
    };
    return result;
  }

  public addRight(
    did: Did,
    lastTxId: TransactionId,
    auth: Authentication,
    right: Right,
  ): ISignableOperationData {
    const result: IAddRightData = {
      operation: SignableOperationType.AddRight,
      did,
      lastTxId,
      auth: auth.toString(),
      right,
    };
    return result;
  }

  public revokeRight(
    did: Did,
    lastTxId: TransactionId,
    auth: Authentication,
    right: Right,
  ): ISignableOperationData {
    const result: IRevokeRightData = {
      operation: SignableOperationType.RevokeRight,
      did,
      lastTxId,
      auth: auth.toString(),
      right,
    };
    return result;
  }

  public tombstoneDid(
    did: string,
    lastTxId: TransactionId,
  ): ISignableOperationData {
    const result: ITombstoneDidData = {
      operation: SignableOperationType.TombstoneDid,
      did,
      lastTxId,
    };
    return result;
  }
}

export const toSignableData = (operation: SignableOperation): ISignableOperationData => {
  return operation.accept(new ToSignableDataVisitor());
};
