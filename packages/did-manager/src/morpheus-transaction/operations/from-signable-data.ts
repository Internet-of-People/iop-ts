import { IO } from '@internet-of-people/sdk';

import {
  IAddKeyData,
  IAddRightData,
  IRevokeKeyData,
  IRevokeRightData,
  ITombstoneDidData,
  ISignableOperationData,
  ISignableOperationTypeVisitor,
  SignableOperation,
} from '../../interfaces';
import { AddKey, AddRight, RevokeKey, RevokeRight, TombstoneDid } from './did-document';
import { visitSignableOperation } from './visitor';

class FromSignableData implements ISignableOperationTypeVisitor<SignableOperation> {
  public constructor(private readonly data: ISignableOperationData) {}

  public addKey(): SignableOperation {
    const params = this.data as IAddKeyData;
    return new AddKey(
      new IO.Did(params.did),
      params.lastTxId,
      IO.authenticationFromData(params.auth),
      params.expiresAtHeight,
    );
  }

  public revokeKey(): SignableOperation {
    const params = this.data as IRevokeKeyData;
    return new RevokeKey(
      new IO.Did(params.did),
      params.lastTxId,
      IO.authenticationFromData(params.auth),
    );
  }

  public addRight(): SignableOperation {
    const params = this.data as IAddRightData;
    return new AddRight(
      new IO.Did(params.did),
      params.lastTxId,
      IO.authenticationFromData(params.auth),
      params.right,
    );
  }

  public revokeRight(): SignableOperation {
    const params = this.data as IRevokeRightData;
    return new RevokeRight(
      new IO.Did(params.did),
      params.lastTxId,
      IO.authenticationFromData(params.auth),
      params.right,
    );
  }

  public tombstoneDid(): SignableOperation {
    const params = this.data as ITombstoneDidData;
    return new TombstoneDid(
      new IO.Did(params.did),
      params.lastTxId,
    );
  }
}

export const fromSignableData = (data: ISignableOperationData): SignableOperation => {
  return visitSignableOperation(data.operation, new FromSignableData(data));
};
