import {Database, State} from "@arkecosystem/core-interfaces";
import {Handlers, TransactionReader} from "@arkecosystem/core-transactions";
import {Interfaces as CryptoIf, Transactions} from "@arkecosystem/crypto";

import {MorpheusTransaction } from "@internet-of-people/did-manager";
import {MorpheusStateHandler} from "./state-handler";

const { Transaction } = MorpheusTransaction;
const { key, type, typeGroup } = Transaction.MorpheusTransaction;

export class MorpheusTransactionHandler extends Handlers.TransactionHandler {
  /*public constructor(private state: IMorpheusState) {
    super();
  }*/

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
    let state = MorpheusStateHandler.instance();
    const reader: TransactionReader = await TransactionReader.create(connection, this.getConstructor());

    while (reader.hasNext()) {
      const transactions = await reader.read();
      for (const transaction of transactions) {
        const stateBackup = state;
        try {
          MorpheusStateHandler.applyTransactionToState(transaction, state);
        } catch (e) {
          state = stateBackup;
          // TODO: log error
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
