import { IOperation, IOperationVisitor, OperationType } from './IOperation';
import { IOperationData, IRegisterBeforeProofData, IRevokeBeforeProofData } from './IOperationData';

/**
 * A visitor that extracts specific data objects needed to represent operations.
 */
class ToDataVisitor implements IOperationVisitor<IOperationData> {
  public registerBeforeProof(contentId: string): IOperationData {
    return {
      operation: OperationType.RegisterBeforeProof,
      contentId
    } as IRegisterBeforeProofData;
  }
  
  public revokeBeforeProof(contentId: string): IOperationData {
    return {
      operation: OperationType.RevokeBeforeProof,
      contentId
    } as IRevokeBeforeProofData;
  }
}

/**
 * This converts IOperation implementations into the IOperationData type.
 * If we want to get rid of IOperationData completely, it is possible to do so in the future.
 * @param operation The operation model to convert
 */
export const toData = (operation: IOperation): IOperationData => {
  return operation.accept(new ToDataVisitor());
};
