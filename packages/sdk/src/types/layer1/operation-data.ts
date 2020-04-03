import * as Crypto from '../crypto';
import * as Sdk from '../sdk';
import { OperationType, SignableOperationType } from '../../layer1/operation-type';

/**
 * Data transfer object for IOperation implementations.
 */
export interface IOperationData {
  operation: OperationType;
}

export interface ISignableOperationData {
  did: Crypto.DidData;
  lastTxId: Sdk.TransactionId | null;
  operation: SignableOperationType;
}

export interface ISignedOperationsData extends IOperationData {
  signables: ISignableOperationData[];
  signerPublicKey: Crypto.PublicKeyData;
  signature: Crypto.SignatureData;
}

/**
 * Data transfer object of RegisterBeforeProof.
 */
export interface IRegisterBeforeProofData extends IOperationData {
  contentId: Sdk.ContentId;
}

/**
 * Data transfer object of AddKey.
 */
export interface IAddKeyData extends ISignableOperationData {
  auth: Crypto.AuthenticationData;
  expiresAtHeight?: number;
}

/**
 * Data transfer object of RevokeKey.
 */
export interface IRevokeKeyData extends ISignableOperationData {
  auth: Crypto.AuthenticationData;
}

/**
 * Data transfer object of AddRight.
 */
export interface IAddRightData extends ISignableOperationData {
  auth: Crypto.AuthenticationData;
  right: Sdk.Right;
}

/**
 * Data transfer object of RevokeRight.
 */
export interface IRevokeRightData extends ISignableOperationData {
  auth: Crypto.AuthenticationData;
  right: Sdk.Right;
}

/**
 * Data transfer object of Tombstone.
 */
/* eslint @typescript-eslint/no-empty-interface:0 */
export interface ITombstoneDidData extends ISignableOperationData {
}
