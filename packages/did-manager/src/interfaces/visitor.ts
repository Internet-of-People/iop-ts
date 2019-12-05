/**
 * Most of the time we have a heterogenous collection of
 * operations. The visitor pattern allows us to implement many
 * algorithms that work on the limited set of operation types.
 */
import {Authentication, Did} from "./did-document";

export interface IOperationVisitor<T> {
  registerBeforeProof(contentId: string): T;
  revokeBeforeProof(contentId: string): T;
  addKey(did: Did, auth: Authentication, expiresAtHeight: number | undefined): T;
}

export interface IOperationTypeVisitor<R> {
  registerBeforeProof(): R;
  revokeBeforeProof(): R;
  addKey(): R;
}