import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { IAppLog, IBlockListener } from '@internet-of-people/hydra-plugin-core';
import { Layer1, Types } from '@internet-of-people/sdk';
import { IMorpheusStateHandler } from '../interfaces/morpheus';

/**
 * Handles Morpheus custom transactions on Layer 2 (IMorpheusState)
 */
export class BlockHandler implements IBlockListener {
  public constructor(
    private readonly stateHandler: IMorpheusStateHandler,
    private readonly log: IAppLog,
  ) {}

  public async onBlockApplied(blockData: CryptoIf.IBlockData): Promise<void> {
    if (!blockData.id) {
      this.log.warn(`Block ${blockData.height} does not have id.`);
      return;
    }

    const morpheusTxs = this.getMorpheusTransactions(blockData);
    this.log.debug(`onBlockApplied contains ${morpheusTxs.length} transactions.`);

    if (morpheusTxs.length) {
      for (const transaction of morpheusTxs) {
        this.stateHandler.applyTransactionToState({
          asset: transaction.asset,
          blockHeight: blockData.height,
          blockId: blockData.id,
          /* eslint @typescript-eslint/no-non-null-assertion: 0*/
          transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
        });
      }
    } else {
      this.stateHandler.applyEmptyBlockToState({
        blockHeight: blockData.height,
        blockId: blockData.id,
      });
    }
  }

  public async onBlockReverted(blockData: CryptoIf.IBlockData): Promise<void> {
    if (!blockData.id) {
      this.log.warn(`Block ${blockData.height} does not have id.`);
      return;
    }

    const morpheusTxs = this.getMorpheusTransactions(blockData);
    this.log.debug(`onBlockReverted contains ${morpheusTxs.length} transactions.`);

    if (morpheusTxs.length) {
      for (const transaction of morpheusTxs) {
        this.stateHandler.revertTransactionFromState({
          asset: transaction.asset,
          blockHeight: blockData.height,
          blockId: blockData.id,
          /* eslint @typescript-eslint/no-non-null-assertion: 0*/
          transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
        });
      }
    } else {
      this.stateHandler.revertEmptyBlockFromState({
        blockHeight: blockData.height,
        blockId: blockData.id,
      });
    }
  }

  private getMorpheusTransactions(blockData: CryptoIf.IBlockData): Types.Layer1.IMorpheusData[] {
    if (!blockData.transactions) {
      this.log.info(`Block ${blockData.id} has no transactions`);
      return [];
    }
    return blockData.transactions.filter((tx) => {
      return tx.typeGroup === Layer1.MorpheusTransaction.typeGroup && tx.type === Layer1.MorpheusTransaction.type;
    })
      .map((tx) => {
        return tx as Types.Layer1.IMorpheusData;
      });
  }
}
