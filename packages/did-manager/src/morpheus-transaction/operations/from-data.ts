import {IAddKeyData, IOperationData, IOperationTypeVisitor,
        IRegisterBeforeProofData, IRevokeBeforeProofData} from '../../interfaces';
import { RegisterBeforeProof, RevokeBeforeProof } from "./before-proof";
import {AddKey} from "./did-document";
import { Operation } from './operation';
import { visitOperation } from './visitor';

class FromData implements IOperationTypeVisitor<Operation> {
  public constructor(private readonly data: IOperationData) {}

  // TODO verify schema of params
  public registerBeforeProof(): Operation {
    const params = this.data as IRegisterBeforeProofData;
    return new RegisterBeforeProof(params.contentId);
  }

  public revokeBeforeProof(): Operation {
    const params = this.data as IRevokeBeforeProofData;
    return new RevokeBeforeProof(params.contentId);
  }

  public addKey(): Operation {
    const params = this.data as IAddKeyData;
    return new AddKey(params.did, params.auth);
  }
}

export const fromData = (data: IOperationData): Operation => {
  return visitOperation(data.operation, new FromData(data));
};
