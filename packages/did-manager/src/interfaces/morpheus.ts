import Optional from 'optional-js';

import { Authentication, Did, Right, IDidDocument, IState, IMorpheusAsset, IOperationData } from './index';

export interface IStateChange {
  asset: IMorpheusAsset;
  blockHeight: number;
  blockId: string;
  transactionId: string;
}

export const MORPHEUS_STATE_HANDLER_COMPONENT_NAME = 'morpheus-state-handler';

export interface IMorpheusStateHandler {
  readonly query: IMorpheusQueries;
  readonly lastSeenBlockHeight: number;
  dryRun(operationAttempts: IOperationData[]): IDryRunOperationError[];
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

  revokeKey(
    height: number,
    signerAuth: Authentication,
    did: Did,
    revokedAuth: Authentication,
  ): void;

  addRight(
    height: number,
    signerAuth: Authentication,
    did: Did,
    auth: Authentication,
    right: Right,
  ): void;

  revokeRight(
    height: number,
    signerAuth: Authentication,
    did: Did,
    auth: Authentication,
    right: Right,
  ): void;

  tombstoneDid(
    height: number,
    signerAuth: Authentication,
    did: Did,
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

export interface IDryRunOperationError {
  invalidOperationAttempt: IOperationData | undefined;
  // code: number; TODO: later we need exact error codes
  message: string;
}
