import {
  Did,
  authenticationFromData,
} from '@internet-of-people/morpheus-crypto';
import {
  IAddKeyData,
  IAddRightData,
  IRevokeKeyData,
  IRevokeRightData,
  ITombstoneDidData,
  ISignableOperationData,
  ISignableOperationTypeVisitor,
} from '../../types/layer1';
import { SignableOperation } from '../operation';
import { visitSignableOperation } from '../visitor';
import { AddKey } from './add-key';
import { AddRight } from './add-right';
import { RevokeKey } from './revoke-key';
import { RevokeRight } from './revoke-right';
import { TombstoneDid } from './tombstone-did';

class FromSignableData implements ISignableOperationTypeVisitor<SignableOperation> {
  public constructor(private readonly data: ISignableOperationData) {}

  public addKey(): SignableOperation {
    const params = this.data as IAddKeyData;
    return new AddKey(
      new Did(params.did),
      params.lastTxId,
      authenticationFromData(params.auth),
      params.expiresAtHeight,
    );
  }

  public revokeKey(): SignableOperation {
    const params = this.data as IRevokeKeyData;
    return new RevokeKey(
      new Did(params.did),
      params.lastTxId,
      authenticationFromData(params.auth),
    );
  }

  public addRight(): SignableOperation {
    const params = this.data as IAddRightData;
    return new AddRight(
      new Did(params.did),
      params.lastTxId,
      authenticationFromData(params.auth),
      params.right,
    );
  }

  public revokeRight(): SignableOperation {
    const params = this.data as IRevokeRightData;
    return new RevokeRight(
      new Did(params.did),
      params.lastTxId,
      authenticationFromData(params.auth),
      params.right,
    );
  }

  public tombstoneDid(): SignableOperation {
    const params = this.data as ITombstoneDidData;
    return new TombstoneDid(
      new Did(params.did),
      params.lastTxId,
    );
  }
}

export const fromSignableData = (data: ISignableOperationData): SignableOperation => {
  return visitSignableOperation(data.operation, new FromSignableData(data));
};
