import { Interfaces as CryptoIf } from "@arkecosystem/crypto";
import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { IBlockEventSource } from './block-event-source';
import { IInitializable } from './main';
import { MorpheusStateHandler } from "./state-handler";

const { Transaction: { MorpheusTransaction: { type, typeGroup } } } = MorpheusTransaction;

/**
 * Handles Morpheus custom transactions on Layer 2 (IMorpheusState)
 */
export class BlockHandler implements IInitializable{
  private static readonly SUBSCRIPTION_ID = 'Morpheus block-handler';

  constructor(private blockEventSource: IBlockEventSource) {
  }

  public async init(): Promise<void> {
    this.blockEventSource.subscribe(BlockHandler.SUBSCRIPTION_ID, this);
  }

  public async onBlockApplied(block: CryptoIf.IBlockData): Promise<void> {
    for (const transaction of this.getMorpheusTransactions(block)) {
      MorpheusStateHandler.instance().applyTransactionToState({
        asset: transaction.asset as Interfaces.IMorpheusAsset,
        blockHeight: block.height,
        blockId: block.id!, // !, because block is already forged, hence cannot be undefined
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });

      if(MorpheusStateHandler.instance().isCorrupted) {
        this.blockEventSource.unsubscribe(BlockHandler.SUBSCRIPTION_ID);
        return;
      }
    }
  }

  public async onBlockReverted(block: CryptoIf.IBlockData): Promise<void> {
    for (const transaction of this.getMorpheusTransactions(block)) {
      MorpheusStateHandler.instance().revertTransactionFromState({
        asset: transaction.asset as Interfaces.IMorpheusAsset,
        blockHeight: block.height,
        blockId: block.id!, // !, because block is already forged, hence cannot be undefined
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });

      if(MorpheusStateHandler.instance().isCorrupted) {
        this.blockEventSource.unsubscribe(BlockHandler.SUBSCRIPTION_ID);
        return;
      }
    }
  }

  private getMorpheusTransactions(block: CryptoIf.IBlockData): Interfaces.IMorpheusData[]  {
    return (block.transactions||[])
      .filter(tx => tx.typeGroup === typeGroup && tx.type === type)
      .map(tx=>tx as Interfaces.IMorpheusData);
  }
}
