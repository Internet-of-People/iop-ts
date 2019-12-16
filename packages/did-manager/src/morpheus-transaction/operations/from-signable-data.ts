import {
  authenticationFromData,
  IAddKeyData,
  IAddRightData,
  IRevokeKeyData,
  IRevokeRightData,
  ISignableOperationData,
  ISignableOperationTypeVisitor,
  SignableOperation,
} from '../../interfaces';
import { AddKey, AddRight, RevokeKey, RevokeRight } from './did-document';
import { visitSignableOperation } from './visitor';

class FromSignableData implements ISignableOperationTypeVisitor<SignableOperation> {
  public constructor(private readonly data: ISignableOperationData) {}

  public addKey(): SignableOperation {
    const params = this.data as IAddKeyData;
    return new AddKey(params.did, authenticationFromData(params.auth), params.expiresAtHeight);
  }

  public revokeKey(): SignableOperation {
    const params = this.data as IRevokeKeyData;
    return new RevokeKey(params.did, authenticationFromData(params.auth));
  }

  public addRight(): SignableOperation {
    const params = this.data as IAddRightData;
    return new AddRight(params.did, authenticationFromData(params.auth), params.right);
  }

  public revokeRight(): SignableOperation {
    const params = this.data as IRevokeRightData;
    return new RevokeRight(params.did, authenticationFromData(params.auth), params.right);
  }
}

export const fromSignableData = (data: ISignableOperationData): SignableOperation => {
  return visitSignableOperation(data.operation, new FromSignableData(data));
};
