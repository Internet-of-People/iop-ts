import Optional from 'optional-js';

import { Crypto, Types } from '@internet-of-people/sdk';

export interface IBlockHeightChange {
  blockHeight: number;
  blockId: string;
}

export interface IStateChange extends IBlockHeightChange {
  asset: Types.Layer1.IMorpheusAsset;
  transactionId: string;
}

export const MORPHEUS_STATE_HANDLER_COMPONENT_NAME = 'morpheus-state-handler';

export interface IMorpheusStateHandler {
  readonly query: IMorpheusQueries;
  dryRun(asset: Types.Layer1.IMorpheusAsset): Types.Layer2.IDryRunOperationError[];
  blockApplying(change: IBlockHeightChange): void;
  applyTransactionToState(stateChange: IStateChange): void;
  blockReverting(change: IBlockHeightChange): void;
  revertTransactionFromState(stateChange: IStateChange): void;
}

export interface IMorpheusQueries {
  lastSeenBlockHeight(): number;
  beforeProofExistsAt(contentId: Types.Sdk.ContentId, height?: number): boolean;
  getBeforeProofHistory(contentId: Types.Sdk.ContentId): Types.Layer2.IBeforeProofHistory;
  isConfirmed(transactionId: Types.Sdk.TransactionId): Optional<boolean>;
  getDidDocumentAt(did: Types.Crypto.DidData, height: number): Types.Layer2.IDidDocument;
  getDidTransactionIds(
    did: Types.Crypto.DidData,
    includeAttempts: boolean,
    fromHeightIncl: number,
    untilHeightIncl?: number,
  ): Types.Layer2.ITransactionIdHeight[];
}

export const enum MorpheusEvents {
  StateCorrupted = 'morpheus.state.corrupted',
}
