import {Authentication, Did} from './did-document';
import { OperationType, SignableOperationType } from './operation-type';

/**
 * Data transfer object for IOperation implementations.
 */
export interface IOperationData {
  operation: OperationType;
}

export interface ISignableOperationData {
  operation: SignableOperationType;
}

export interface ISignedOperationsData extends IOperationData {
  signables: ISignableOperationData[];
  signerDid: string;
  signerPublicKey: string;
  signature: string;
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
export interface IAddKeyData extends ISignableOperationData {
  did: Did;
  auth: Authentication;
  expiresAtHeight?: number;
}
