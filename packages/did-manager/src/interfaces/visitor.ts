import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type Right = IO.Right;
type TransactionId = IO.TransactionId;

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
  addKey(did: Did, lastTxId: TransactionId | null, auth: Authentication, expiresAtHeight?: number): T;
  revokeKey(did: Did, lastTxId: TransactionId | null, auth: Authentication): T;
  addRight(did: Did, lastTxId: TransactionId | null, auth: Authentication, right: Right): T;
  revokeRight(did: Did, lastTxId: TransactionId | null, auth: Authentication, right: Right): T;
  tombstoneDid(did: Did, lastTxId: TransactionId | null): T;
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
