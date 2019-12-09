import { Interfaces } from '@internet-of-people/did-manager';
import Optional from 'optional-js';

export interface IMorpheusOperations {
  registerBeforeProof(contentId: string, height: number): void;
  revokeBeforeProof(contentId: string, height: number): void;

  addKey(height: number, did: Interfaces.Did, auth: Interfaces.Authentication, expiresAtHeight?: number): void;

  /**
   * Marks a transaction as confirmed, all operations were valid.
   */
  confirmTx(transactionId: string): void;
  rejectTx(transactionId: string): void;
}

export interface IMorpheusQueries {
  beforeProofExistsAt(contentId: string, height?: number): boolean;
  isConfirmed(transactionId: string): Optional<boolean>;
  getDidDocumentAt(did: Interfaces.Did, height: number): Interfaces.IDidDocument;
}

export type IMorpheusState = Interfaces.IState<IMorpheusQueries, IMorpheusOperations>;

export const enum MorpheusEvents {
  StateCorrupted = 'morpheus.state.corrupted',
}
