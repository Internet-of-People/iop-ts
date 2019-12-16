import Optional from 'optional-js';

import { Authentication, Did, Right, IDidDocument, IState, IMorpheusAsset } from './index';

export interface IStateChange {
  asset: IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export const MORPHEUS_STATE_HANDLER_COMPONENT_NAME = 'morpheus-state-handler';

export interface IMorpheusStateHandler {
  readonly query: IMorpheusQueries;
  applyTransactionToState(stateChange: IStateChange): void;
  revertTransactionFromState(stateChange: IStateChange): void;
}

export interface IMorpheusOperations {
  registerBeforeProof(contentId: string, height: number): void;
  revokeBeforeProof(contentId: string, height: number): void;

  addKey(
    height: number,
    signerAuth: Authentication,
    did: Did,
    newAuth: Authentication,
    expiresAtHeight?: number,
  ): void;

  addRight(
    height: number,
    signerAuth: Authentication,
    did: Did,
    auth: Authentication,
    right: Right
  ): void;

  /**
   * Marks a transaction as confirmed, all operations were valid.
   */
  confirmTx(transactionId: string): void;
  rejectTx(transactionId: string): void;
}

export interface IMorpheusQueries {
  beforeProofExistsAt(contentId: string, height?: number): boolean;
  isConfirmed(transactionId: string): Optional<boolean>;
  getDidDocumentAt(did: Did, height: number): IDidDocument;
}

export type IMorpheusState = IState<IMorpheusQueries, IMorpheusOperations>;

export const enum MorpheusEvents {
  StateCorrupted = 'morpheus.state.corrupted',
}
