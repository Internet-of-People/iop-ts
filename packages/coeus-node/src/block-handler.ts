import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { CoeusTransaction, ICoeusData } from '@internet-of-people/coeus-proto';
import { IAppLog, IBlockListener } from '@internet-of-people/hydra-plugin-core';
import { StateHandler } from './state-handler';

export class BlockHandler implements IBlockListener {
  public constructor(
    private stateHandler: StateHandler,
    private log: IAppLog,
  ){}

  public async onBlockApplied(blockData: CryptoIf.IBlockData): Promise<void> {
    if (!blockData.id) {
      this.log.warn(`Block ${blockData.height} does not have id.`);
      return;
    }

    const coeusTxs = this.getCoeusTransactions(blockData);
    this.log.debug(`onBlockApplied contains ${coeusTxs.length} transactions.`);

    this.stateHandler.blockStarted(blockData.height);

    for (const transaction of coeusTxs) {
      this.stateHandler.applyTransactionToState({
        asset: transaction.asset,
        blockHeight: blockData.height,
        blockId: blockData.id,
        /* eslint @typescript-eslint/no-non-null-assertion: 0*/
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });
    }
  }

  public async onBlockReverted(blockData: CryptoIf.IBlockData): Promise<void> {
    if (!blockData.id) {
      this.log.warn(`Block ${blockData.height} does not have id.`);
      return;
    }

    const coeusTxs = this.getCoeusTransactions(blockData);
    this.log.debug(`onBlockApplied contains ${coeusTxs.length} transactions.`);

    if (coeusTxs.length) {
      for (const transaction of coeusTxs) {
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

  private getCoeusTransactions(blockData: CryptoIf.IBlockData): ICoeusData[] {
    if (!blockData.transactions) {
      this.log.info(`Block ${blockData.id} has no transactions`);
      return [];
    }

    return blockData.transactions.filter((tx) => {
      return tx.typeGroup === CoeusTransaction.typeGroup && tx.type === CoeusTransaction.type;
    })
      .map((tx) => {
        return tx as ICoeusData;
      });
  }
}