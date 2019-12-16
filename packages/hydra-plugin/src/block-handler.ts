import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { IAppLog } from '@internet-of-people/logger';
import { IBlockListener } from './block-event-source';

const { Transaction: { MorpheusTransaction: { type, typeGroup } } } = MorpheusTransaction;

/**
 * Handles Morpheus custom transactions on Layer 2 (IMorpheusState)
 */
export class BlockHandler implements IBlockListener {
  public constructor(
    private readonly stateHandler: Interfaces.IMorpheusStateHandler,
    private readonly log: IAppLog,
  ) {}

  /* eslint @typescript-eslint/require-await:0 */
  public async onBlockApplied(blockData: CryptoIf.IBlockData): Promise<void> {
    if (!blockData.id) {
      this.log.warn(`Block ${blockData.height} does not have id.`);
      return;
    }

    const morpheusTxs = this.getMorpheusTransactions(blockData);
    this.log.debug(`onBlockApplied contains ${morpheusTxs.length} transactions.`);

    for (const transaction of morpheusTxs) {
      this.stateHandler.applyTransactionToState({
        asset: transaction.asset,
        blockHeight: blockData.height,
        blockId: blockData.id,
        /* eslint @typescript-eslint/no-non-null-assertion: 0*/
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });
    }
  }

  /* eslint @typescript-eslint/require-await:0 */
  public async onBlockReverted(blockData: CryptoIf.IBlockData): Promise<void> {
    if (!blockData.id) {
      this.log.warn(`Block ${blockData.height} does not have id.`);
      return;
    }

    const morpheusTxs = this.getMorpheusTransactions(blockData);
    this.log.debug(`onBlockReverted contains ${morpheusTxs.length} transactions.`);

    for (const transaction of morpheusTxs) {
      this.stateHandler.revertTransactionFromState({
        asset: transaction.asset,
        blockHeight: blockData.height,
        blockId: blockData.id,
        /* eslint @typescript-eslint/no-non-null-assertion: 0*/
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });
    }
  }

  private getMorpheusTransactions(blockData: CryptoIf.IBlockData): Interfaces.IMorpheusData[] {
    if (!blockData.transactions) {
      this.log.info(`Block ${blockData.id} has no transactions`);
      return [];
    }
    return blockData.transactions.filter((tx) => {
      return tx.typeGroup === typeGroup && tx.type === type;
    })
      .map((tx) => {
        return tx as Interfaces.IMorpheusData;
      });
  }
}
