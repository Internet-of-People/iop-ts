import {Authentication, Did, IAddKeyData, IOperationVisitor} from '../../interfaces';
import {IOperationData, IRegisterBeforeProofData, IRevokeBeforeProofData} from '../../interfaces/operation-data';
import {Operation} from './operation';
import {OperationType} from './operation-type';

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

  public addKey(did: Did, auth: Authentication): IAddKeyData {
    return {
      operation: OperationType.AddKey,
      did,
      auth
    } as IAddKeyData;
  }
}

/**
 * This converts IOperation implementations into the IOperationData type.
 * If we want to get rid of IOperationData completely, it is possible to do so in the future.
 * @param operation The operation model to convert
 */
export const toData = (operation: Operation): IOperationData => {
  return operation.accept(new ToDataVisitor());
};
