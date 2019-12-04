import { app } from "@arkecosystem/core-container";
import { Database, State } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces as CryptoIf, Transactions } from "@arkecosystem/crypto";

import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { COMPONENT_NAME as STATE_HANDLER_COMPONENT, IMorpheusStateHandler } from "./state-handler";
import { COMPONENT_NAME as READER_FACTORY_COMPONENT, ITransactionReader, TransactionReaderFactory } from './transaction-reader-factory';

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
    // Note: here we assume that when a block is reverted, the fact of the revert is NOT stored in the database.
    // This means, when a node is bootstrapped from scratch, it will not see any reverted blocks.
    const readerFactory: TransactionReaderFactory = app.resolve(READER_FACTORY_COMPONENT);
    const reader: ITransactionReader = await readerFactory(connection, this.getConstructor());
    const stateHandler: IMorpheusStateHandler = app.resolve(STATE_HANDLER_COMPONENT);

    while (reader.hasNext()) {
      const transactions = await reader.read();
      for (const transaction of transactions) {
        stateHandler.applyTransactionToState({
          asset: transaction.asset as Interfaces.IMorpheusAsset,
          blockHeight: transaction.blockHeight,
          blockId: transaction.blockId,
          transactionId: transaction.id,
        });
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
