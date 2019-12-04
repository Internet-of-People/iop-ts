import { Database, State } from "@arkecosystem/core-interfaces";
import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces as CryptoIf, Transactions } from "@arkecosystem/crypto";

import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { MorpheusStateHandler } from "./state-handler";

const { Transaction } = MorpheusTransaction;

/**
 * Handles Morpheus custom transactions on Layer 1 (IWalletManager)
 */
export class MorpheusTransactionHandler extends Handlers.TransactionHandler {
  public getConstructor(): typeof Transactions.Transaction {
    return Transaction.MorpheusTransaction;
  }

  public dependencies(): readonly Handlers.TransactionHandlerConstructor[] {
    return [];
  }

  public walletAttributes(): readonly string[] {
    return [];
  }

  public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
    const reader: TransactionReader = await TransactionReader.create(connection, this.getConstructor());

    while (reader.hasNext()) {
      const transactions = await reader.read();
      for (const transaction of transactions) {
        MorpheusStateHandler.instance().applyTransactionToState({
          asset: transaction.asset as Interfaces.IMorpheusAsset,
          blockHeight: transaction.blockHeight,
          blockId: transaction.blockId,
          transactionId: transaction.id,
        });

        if(MorpheusStateHandler.instance().isCorrupted()) {
          return;
        }
      }
    }
  }

  public async isActivated(): Promise<boolean> {
    return true;
  }

  public async applyToRecipient(transaction: CryptoIf.ITransaction, walletManager: State.IWalletManager): Promise<void> {
    // nothing to do here
  }

  public async revertForRecipient(transaction: CryptoIf.ITransaction, walletManager: State.IWalletManager): Promise<void> {
    // nothing to do here
  }
}
