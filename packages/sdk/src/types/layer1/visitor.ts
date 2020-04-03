import { Did } from '@internet-of-people/morpheus-crypto';
import * as Crypto from '../crypto';
import * as Sdk from '../sdk';
import { ISignedOperationsData } from './operation-data';

/**
 * Most of the time we have a heterogenous collection of
 * operations. The visitor pattern allows us to implement many
 * algorithms that work on the limited set of operation types.
 */
export interface IOperationVisitor<T> {
  signed(operations: ISignedOperationsData): T;
  registerBeforeProof(contentId: string): T;
}

export interface ISignableOperationVisitor<T> {
  addKey(did: Did, lastTxId: Sdk.TransactionId | null, auth: Crypto.Authentication, expiresAtHeight?: number): T;
  revokeKey(did: Did, lastTxId: Sdk.TransactionId | null, auth: Crypto.Authentication): T;
  addRight(did: Did, lastTxId: Sdk.TransactionId | null, auth: Crypto.Authentication, right: Sdk.Right): T;
  revokeRight(did: Did, lastTxId: Sdk.TransactionId | null, auth: Crypto.Authentication, right: Sdk.Right): T;
  tombstoneDid(did: Did, lastTxId: Sdk.TransactionId | null): T;
}

export interface IOperationTypeVisitor<R> {
  signed(): R;
  registerBeforeProof(): R;
}

export interface ISignableOperationTypeVisitor<R> {
  addKey(): R;
  revokeKey(): R;
  addRight(): R;
  revokeRight(): R;
  tombstoneDid(): R;
}
