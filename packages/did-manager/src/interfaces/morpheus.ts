import Optional from 'optional-js';

import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type Right = IO.Right;
type TransactionId = IO.TransactionId;

import { IMorpheusAsset } from './asset';
import { IDidDocument, ITransactionIdHeight } from './did-document';
import { Operation } from './operation';
import { IOperationData } from './operation-data';
import { IState } from './state';

export interface IBlockHeightChange {
  blockHeight: number;
  blockId: string;
}

export interface IStateChange extends IBlockHeightChange {
  asset: IMorpheusAsset;
  transactionId: string;
}

export const MORPHEUS_STATE_HANDLER_COMPONENT_NAME = 'morpheus-state-handler';

export interface IMorpheusStateHandler {
  readonly query: IMorpheusQueries;
  dryRun(operationAttempts: IOperationData[]): IDryRunOperationError[];
  applyEmptyBlockToState(change: IBlockHeightChange): void;
  applyTransactionToState(stateChange: IStateChange): void;
  revertEmptyBlockFromState(change: IBlockHeightChange): void;
  revertTransactionFromState(stateChange: IStateChange): void;
}

export interface IMorpheusOperations {
  setLastSeenBlockHeight(height: number): void;
  registerOperationAttempt(height: number, transactionId: string, operation: Operation): void;

  registerBeforeProof(contentId: string, height: number): void;

  addKey(
    height: number,
    signerAuth: Authentication,
    did: Did,
    lastTxId: TransactionId | null,
    newAuth: Authentication,
    expiresAtHeight?: number,
  ): void;

  revokeKey(
    height: number,
    signerAuth: Authentication,
    did: Did,
    lastTxId: TransactionId | null,
    revokedAuth: Authentication,
  ): void;

  addRight(
    height: number,
    signerAuth: Authentication,
    did: Did,
    lastTxId: TransactionId | null,
    auth: Authentication,
    right: Right,
  ): void;

  revokeRight(
    height: number,
    signerAuth: Authentication,
    did: Did,
    lastTxId: TransactionId | null,
    auth: Authentication,
    right: Right,
  ): void;

  tombstoneDid(
    height: number,
    signerAuth: Authentication,
    did: Did,
    lastTxId: TransactionId | null,
  ): void;

  /**
   * Marks a transaction as confirmed, all operations were valid.
   */
  confirmTx(transactionId: string): void;
  rejectTx(transactionId: string): void;
}

export interface IMorpheusQueries {
  lastSeenBlockHeight(): number;
  beforeProofExistsAt(contentId: string, height?: number): boolean;
  isConfirmed(transactionId: string): Optional<boolean>;
  getDidDocumentAt(did: Did, height: number): IDidDocument;
  getDidTransactionIds(
    did: Did,
    includeAttempts: boolean,
    fromHeightInc: number,
    untilHeightExc?: number,
  ): ITransactionIdHeight[];
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
