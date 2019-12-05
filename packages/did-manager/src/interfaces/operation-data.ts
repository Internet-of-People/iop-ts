import { OperationType } from '../morpheus-transaction/operations/operation-type';
import {Authentication, Did} from "./did-document";

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

/**
 * Data transfer object of AddKey.
 */
export interface IAddKeyData extends IOperationData {
  did: Did;
  auth: Authentication;
  expiresAtHeight?: number;
}
