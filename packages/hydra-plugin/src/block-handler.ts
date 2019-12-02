import { Interfaces as CryptoIf } from "@arkecosystem/crypto";
import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { MorpheusStateHandler } from "./state-handler";

const { Transaction: { MorpheusTransaction: { type, typeGroup } } } = MorpheusTransaction;

/**
 * Handles Morpheus custom transactions on Layer 2 (IMorpheusState)
 */
export class BlockHandler {
  public async onBlockApplied(block: CryptoIf.IBlockData): Promise<void> {
    for (const transaction of this.getMorpheusTransactions(block)) {
      MorpheusStateHandler.instance().applyTransactionToState({
        asset: transaction.asset as Interfaces.IMorpheusAsset,
        blockHeight: block.height,
        blockId: block.id!, // !, because block is already forged, hence cannot be undefined
        transactionId: transaction.id!, // !, because block is already forged, hence cannot be undefined
      });
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
    }
  }

  private getMorpheusTransactions(block: CryptoIf.IBlockData): Interfaces.IMorpheusData[]  {
    return (block.transactions||[])
      .filter(tx => tx.typeGroup === typeGroup && tx.type === type)
      .map(tx=>tx as Interfaces.IMorpheusData);
  }
}
