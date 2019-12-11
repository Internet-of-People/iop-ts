import { IAddKeyData, ISignableOperationData, ISignableOperationTypeVisitor } from '../../interfaces';
import { SignableOperation } from '../../interfaces/operation';
import { AddKey } from './did-document';
import { visitSignableOperation } from './visitor';

class FromSignableData implements ISignableOperationTypeVisitor<SignableOperation> {
  public constructor(private readonly data: ISignableOperationData) {}

  public addKey(): SignableOperation {
    const params = this.data as IAddKeyData;
    return new AddKey(params.did, params.auth, params.expiresAtHeight);
  }
}

export const fromSignableData = (data: ISignableOperationData): SignableOperation => {
  return visitSignableOperation(data.operation, new FromSignableData(data));
};
