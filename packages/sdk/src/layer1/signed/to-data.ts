import { Did } from '@internet-of-people/morpheus-crypto';
import { Crypto, Sdk } from '../../types';
import {
  IAddKeyData,
  IAddRightData, IRevokeKeyData, IRevokeRightData,
  ISignableOperationData,
  ISignableOperationVisitor, ITombstoneDidData,
} from '../../types/layer1';
import { SignableOperation } from '../operation';
import { SignableOperationType } from '../operation-type';

class ToSignableDataVisitor implements ISignableOperationVisitor<ISignableOperationData> {
  public addKey(
    did: Did,
    lastTxId: Sdk.TransactionId,
    auth: Crypto.Authentication,
    expiresAtHeight?: number,
  ): ISignableOperationData {
    const result: IAddKeyData = {
      operation: SignableOperationType.AddKey,
      did: did.toString(),
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
    lastTxId: Sdk.TransactionId,
    auth: Crypto.Authentication,
  ): ISignableOperationData {
    const result: IRevokeKeyData = {
      operation: SignableOperationType.RevokeKey,
      did: did.toString(),
      lastTxId,
      auth: auth.toString(),
    };
    return result;
  }

  public addRight(
    did: Did,
    lastTxId: Sdk.TransactionId,
    auth: Crypto.Authentication,
    right: Sdk.Right,
  ): ISignableOperationData {
    const result: IAddRightData = {
      operation: SignableOperationType.AddRight,
      did: did.toString(),
      lastTxId,
      auth: auth.toString(),
      right,
    };
    return result;
  }

  public revokeRight(
    did: Did,
    lastTxId: Sdk.TransactionId,
    auth: Crypto.Authentication,
    right: Sdk.Right,
  ): ISignableOperationData {
    const result: IRevokeRightData = {
      operation: SignableOperationType.RevokeRight,
      did: did.toString(),
      lastTxId,
      auth: auth.toString(),
      right,
    };
    return result;
  }

  public tombstoneDid(
    did: Did,
    lastTxId: Sdk.TransactionId,
  ): ISignableOperationData {
    const result: ITombstoneDidData = {
      operation: SignableOperationType.TombstoneDid,
      did: did.toString(),
      lastTxId,
    };
    return result;
  }
}

export const toSignableData = (operation: SignableOperation): ISignableOperationData => {
  return operation.accept(new ToSignableDataVisitor());
};
