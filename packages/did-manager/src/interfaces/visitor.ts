/**
 * Most of the time we have a heterogenous collection of
 * operations. The visitor pattern allows us to implement many
 * algorithms that work on the limited set of operation types.
 */
import { Authentication, Did, ISignedOperationsData, Right } from '.';

export interface IOperationVisitor<T> {
  signed(operations: ISignedOperationsData): T;
  registerBeforeProof(contentId: string): T;
  revokeBeforeProof(contentId: string): T;
}

export interface ISignableOperationVisitor<T> {
  addKey(did: Did, auth: Authentication, expiresAtHeight?: number): T;
  addRight(did: Did, auth: Authentication, right: Right): T;
}

export interface IOperationTypeVisitor<R> {
  signed(): R;
  registerBeforeProof(): R;
  revokeBeforeProof(): R;
}

export interface ISignableOperationTypeVisitor<R> {
  addKey(): R;
  addRight(): R;
}
