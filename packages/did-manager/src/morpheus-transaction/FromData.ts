import { IOperationTypeVisitor, visit } from './AllOperations';
import { IOperation } from './IOperation';
import { IOperationData, IRegisterBeforeProofData, IRevokeBeforeProofData } from './IOperationData';
import { RegisterBeforeProof } from "./RegisterBeforeProof";
import { RevokeBeforeProof } from "./RevokeBeforeProof";

class FromData implements IOperationTypeVisitor<IOperation> {
  public constructor(private readonly data: IOperationData) {}

  // TODO verify schema of params
  public registerBeforeProof(): IOperation {
    const params = this.data as IRegisterBeforeProofData;
    return new RegisterBeforeProof(params.contentId);
  }

  public revokeBeforeProof(): IOperation {
    const params = this.data as IRevokeBeforeProofData;
    return new RevokeBeforeProof(params.contentId);
  }
}

export const fromData = (data: IOperationData): IOperation => {
  return visit(data.operation, new FromData(data));
};
