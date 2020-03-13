import { IO } from '@internet-of-people/sdk';
type AuthenticationData = IO.AuthenticationData;
type Did = IO.Did;
type Right = IO.Right;
type TransactionId = IO.TransactionId;
type PublicKeyData = IO.PublicKeyData;
type SignatureData = IO.SignatureData;

import { OperationType, SignableOperationType } from './operation-type';

/**
 * Data transfer object for IOperation implementations.
 */
export interface IOperationData {
  operation: OperationType;
}

export interface ISignableOperationData {
  did: Did;
  lastTxId: TransactionId | null;
  operation: SignableOperationType;
}

export interface ISignedOperationsData extends IOperationData {
  signables: ISignableOperationData[];
  signerPublicKey: PublicKeyData;
  signature: SignatureData;
}

/**
 * Data transfer object of RegisterBeforeProof.
 */
export interface IRegisterBeforeProofData extends IOperationData {
  contentId: string;
}

/**
 * Data transfer object of AddKey.
 */
export interface IAddKeyData extends ISignableOperationData {
  auth: AuthenticationData;
  expiresAtHeight?: number;
}

/**
 * Data transfer object of RevokeKey.
 */
export interface IRevokeKeyData extends ISignableOperationData {
  auth: AuthenticationData;
}

/**
 * Data transfer object of AddRight.
 */
export interface IAddRightData extends ISignableOperationData {
  auth: AuthenticationData;
  right: Right;
}

/**
 * Data transfer object of RevokeRight.
 */
export interface IRevokeRightData extends ISignableOperationData {
  auth: AuthenticationData;
  right: Right;
}

/**
 * Data transfer object of Tombstone.
 */
/* eslint @typescript-eslint/no-empty-interface:0 */
export interface ITombstoneDidData extends ISignableOperationData {
}
