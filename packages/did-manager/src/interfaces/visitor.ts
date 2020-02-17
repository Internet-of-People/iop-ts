import { ISignedOperationsData } from './operation-data';
import { Authentication, Did, Right } from './did-document';

/**
 * Most of the time we have a heterogenous collection of
 * operations. The visitor pattern allows us to implement many
 * algorithms that work on the limited set of operation types.
 */
export interface IOperationVisitor<T> {
  signed(operations: ISignedOperationsData): T;
  registerBeforeProof(contentId: string): T;
  revokeBeforeProof(contentId: string): T;
}

export interface ISignableOperationVisitor<T> {
  addKey(did: Did, auth: Authentication, expiresAtHeight?: number): T;
  revokeKey(did: Did, auth: Authentication): T;
  addRight(did: Did, auth: Authentication, right: Right): T;
  revokeRight(did: Did, auth: Authentication, right: Right): T;
  tombstoneDid(did: Did): T;
}

export interface IOperationTypeVisitor<R> {
  signed(): R;
  registerBeforeProof(): R;
  revokeBeforeProof(): R;
}

export interface ISignableOperationTypeVisitor<R> {
  addKey(): R;
  revokeKey(): R;
  addRight(): R;
  revokeRight(): R;
  tombstoneDid(): R;
}
