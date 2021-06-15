import { MorpheusState } from '@internet-of-people/node-wasm';
import { Crypto, Types, Layer2 } from '@internet-of-people/sdk';
type IMorpheusAsset = Types.Layer1.IMorpheusAsset;

import {
  IBlockHeightChange,
  IMorpheusQueries,
  IMorpheusStateHandler,
  IStateChange,
  MorpheusEvents,
} from '../interfaces';
import { IAppLog } from '@internet-of-people/hydra-plugin-core';
import optionalJs from 'optional-js';

export class MorpheusStateHandler implements IMorpheusStateHandler {
  private readonly state = new MorpheusState();

  public constructor(
    private readonly logger: IAppLog,
    private readonly eventEmitter: NodeJS.EventEmitter,
  ) {
  }

  public get query(): IMorpheusQueries {
    if (this.state.corrupted) {
      throw new Error('Cannot query corrupted state!');
    }
    return {
      lastSeenBlockHeight: (): number => {
        return this.state.lastBlockHeight();
      },

      beforeProofExistsAt: (contentId: string, height?: number): boolean => {
        return this.state.beforeProofExistsAt(contentId, height);
      },

      getBeforeProofHistory: (contentId: string): Types.Layer2.IBeforeProofHistory => {
        return this.state.beforeProofHistory(contentId);
      },

      isConfirmed: (transactionId: string): optionalJs<boolean> => {
        return optionalJs.ofNullable(this.state.isConfirmed(transactionId));
      },

      getDidDocumentAt: (did: Crypto.Did, height: number): Types.Layer2.IDidDocument => {
        // TODO are we using the Rust implementation here?
        return new Layer2.DidDocument(this.state.getDidDocumentAt(did.toString(), height));
      },

      getDidTransactionIds: (
        did: Crypto.Did,
        includeAttempts: boolean,
        fromHeightIncl: number,
        untilHeightIncl?: number,
      ): Types.Layer2.ITransactionIdHeight[] => {
        return this.state.getTransactionHistory(did.toString(), includeAttempts, fromHeightIncl, untilHeightIncl);
      },
    };
  }

  public dryRun(asset: IMorpheusAsset): Types.Layer2.IDryRunOperationError[] {
    const errors: Types.Layer2.IDryRunOperationError[] = this.state.dryRun(asset);

    return errors;
  }

  public blockApplying(change: IBlockHeightChange): void {
    this.mayCorruptState(() => {
      this.logger.debug(`blockApplying height: ${change.blockHeight} id: ${change.blockId}...`);
      this.state.blockApplying(change.blockHeight);
    });
  }

  public applyTransactionToState(change: IStateChange): void {
    this.maybeRejected(() => {
      this.logger.debug(`applyTransactionToState tx: ${change.transactionId}...`);
      this.logger.debug(` contains ${change.asset.operationAttempts.length} operations...`);
      this.state.applyTransaction(change.transactionId, change.asset);
    });
  }

  public blockReverting(change: IBlockHeightChange): void {
    this.mayCorruptState(() => {
      this.logger.debug(`blockReverting height: ${change.blockHeight} id: ${change.blockId}...`);
      this.state.blockReverting(change.blockHeight);
    });
  }

  public revertTransactionFromState(change: IStateChange): void {
    this.mayCorruptState(() => {
      this.logger.debug(`revertTransactionFromState tx: ${change.transactionId}...`);
      this.logger.debug(` contains ${change.asset.operationAttempts.length} operations...`);
      this.state.revertTransaction(change.transactionId, change.asset);
    });
  }

  private maybeRejected(f: () => void): void {
    try {
      f();
    } catch (e) {
      this.logger.info(e);
    }
  }

  private mayCorruptState(f: () => void): void {
    const wasCorrupted = this.state.corrupted;

    try {
      f();
    } catch (e) {
      this.logger.warn(e);

      if (!wasCorrupted && this.state.corrupted) {
        this.eventEmitter.emit(MorpheusEvents.StateCorrupted);
      }
    }
  }
}
