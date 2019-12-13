import {
  authenticationFromData,
  IAddKeyData,
  IAddRightData,
  ISignableOperationData,
  ISignableOperationTypeVisitor,
  SignableOperation,
} from '../../interfaces';
import { AddKey, AddRight } from './did-document';
import { visitSignableOperation } from './visitor';

class FromSignableData implements ISignableOperationTypeVisitor<SignableOperation> {
  public constructor(private readonly data: ISignableOperationData) {}

  public addKey(): SignableOperation {
    const params = this.data as IAddKeyData;
    return new AddKey(params.did, authenticationFromData(params.auth), params.expiresAtHeight);
  }

  public addRight(): SignableOperation {
    const params = this.data as IAddRightData;
    return new AddRight(params.did, authenticationFromData(params.auth), params.right);
  }
}

export const fromSignableData = (data: ISignableOperationData): SignableOperation => {
  return visitSignableOperation(data.operation, new FromSignableData(data));
};
