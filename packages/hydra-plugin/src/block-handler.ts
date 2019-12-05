import { Database } from "@arkecosystem/core-interfaces";
import { Interfaces as CryptoIf } from "@arkecosystem/crypto";
import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { IAppLog } from "./app-log";
import { MorpheusStateHandler } from "./state-handler";

const { Transaction: { MorpheusTransaction: { type, typeGroup } } } = MorpheusTransaction;

export interface IBlockHandler {
  onBlockApplied(block: CryptoIf.IBlockData): Promise<void>;
  onBlockReverted(block: CryptoIf.IBlockData): Promise<void>;
}

/**
 * Handles Morpheus custom transactions on Layer 2 (IMorpheusState)
 */
export class BlockHandler implements IBlockHandler {
  public static readonly SUBSCRIPTION_ID = 'Morpheus block-handler';

  public constructor(
    private readonly stateHandler: MorpheusStateHandler,
    private readonly log: IAppLog,
    private readonly transactions: Database.ITransactionsBusinessRepository,
  ) {}

  public async onBlockApplied(block: CryptoIf.IBlockData): Promise<void> {
    if(!block.id) {
      this.log.warn(`Block ${block.height} does not have id.`);
      return;
    }

    const morpheusTxs = await this.getMorpheusTransactions(block.id);
    this.log.debug(`onBlockApplied contains ${morpheusTxs.length} transactions.`);
    for (const transaction of morpheusTxs) {
      this.stateHandler.applyTransactionToState({
        asset: transaction.asset as Interfaces.IMorpheusAsset,
        blockHeight: block.height,
        blockId: block.id!, // !, because block is already forged, hence cannot be undefined
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });
    }
  }

  public async onBlockReverted(block: CryptoIf.IBlockData): Promise<void> {
    if(!block.id) {
      this.log.warn(`Block ${block.height} does not have id.`);
      return;
    }

    const morpheusTxs = await this.getMorpheusTransactions(block.id);
    this.log.debug(`onBlockReverted contains ${morpheusTxs.length} transactions.`);
    for (const transaction of morpheusTxs) {
      this.stateHandler.revertTransactionFromState({
        asset: transaction.asset as Interfaces.IMorpheusAsset,
        blockHeight: block.height,
        blockId: block.id!, // !, because block is already forged, hence cannot be undefined
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });
    }
  }

  private async getMorpheusTransactions(blockId: string): Promise<Interfaces.IMorpheusData[]>  {
    const result = await this.transactions.findAllByBlock(blockId);
    return result
      .rows
      .filter(tx => tx.typeGroup === typeGroup && tx.type === type)
      .map(tx=>tx as Interfaces.IMorpheusData);
  }
}
