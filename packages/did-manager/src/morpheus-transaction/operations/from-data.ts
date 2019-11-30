import { IOperationTypeVisitor } from '../../interfaces';
import { IOperationData, IRegisterBeforeProofData, IRevokeBeforeProofData } from '../../interfaces/operation-data';
import { RegisterBeforeProof, RevokeBeforeProof } from "./before-proof";
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
}

export const fromData = (data: IOperationData): Operation => {
  return visitOperation(data.operation, new FromData(data));
};
