import { IOperationTypeVisitor, visit } from './AllOperations';
import { IOperation } from './IOperation';
import { IOperationData, IRegisterBeforeProofParam, IRevokeBeforeProofParam } from './IOperationData';
import { RegisterBeforeProof } from "./RegisterBeforeProof";
import { RevokeBeforeProof } from "./RevokeBeforeProof";

export class Reify implements IOperationTypeVisitor<IOperation> {
  public constructor(private readonly data: IOperationData) {}

  // TODO verify schema of params
  public registerBeforeProof(): IOperation {
    const params = this.data.params as IRegisterBeforeProofParam;
    return new RegisterBeforeProof(params.contentId);
  }

  public revokeBeforeProof(): IOperation {
    const params = this.data.params as IRevokeBeforeProofParam;
    return new RevokeBeforeProof(params.contentId);
  }
}

export const reify = (data: IOperationData): IOperation => {
  return visit(data.operation, new Reify(data));
};
