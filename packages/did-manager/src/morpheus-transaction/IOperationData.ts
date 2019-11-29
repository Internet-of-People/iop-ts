import { IOperation, IOperationVisitor } from './IOperation';

/**
 * Marker interface for all data specific to a given operation type.
 */
export interface IOperationParam {}

/**
 * Data type to transfer operations between layers in the code.
 * This should have been called IOperationData
 */
export interface IOperationData {
  operation: string;
  params: IOperationParam;
}

/**
 * Data specific to the RegisterBeforeProof operation.
 */
export interface IRegisterBeforeProofParam extends IOperationParam {
  contentId: string;
}

/**
 * Data specific to the RevokeBeforeProof operation.
 */
export interface IRevokeBeforeProofParam extends IOperationParam {
  contentId: string;
}

/**
 * A visitor that extracts specific data objects needed to represent operations.
 */
export class ParamVisitor implements IOperationVisitor<IOperationParam> {
  public registerBeforeProof(contentId: string): IOperationParam {
    return { contentId } as IRegisterBeforeProofParam;
  }
  
  public revokeBeforeProof(contentId: string): IOperationParam {
    return { contentId } as IRevokeBeforeProofParam;
  }
}

/**
 * This converts IOperation implementations into the IOperationData type.
 * If we want to get rid of IOperationData completely, it is possible to do so in the future.
 * @param operation The operation model to convert
 */
export const erase = (operation: IOperation): IOperationData => {
  return {
    operation: operation.type,
    params: operation.accept(new ParamVisitor()),
  };
};
