import { OperationType } from '../morpheus-transaction/operations/operation-type';

/**
 * Data transfer object for IOperation implementations.
 */
export interface IOperationData {
  operation: OperationType;
}

/**
 * Data transfer object of RegisterBeforeProof.
 */
export interface IRegisterBeforeProofData extends IOperationData {
  contentId: string;
}

/**
 * Data transfer object of RevokeBeforeProof.
 */
export interface IRevokeBeforeProofData extends IOperationData {
  contentId: string;
}
