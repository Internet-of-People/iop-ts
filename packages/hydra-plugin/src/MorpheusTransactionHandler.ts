import { Database, State } from "@arkecosystem/core-interfaces";
import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";

import { MorpheusTransaction } from "@internet-of-people/did-manager";
const { Transaction } = MorpheusTransaction;
const { key, type, typeGroup } = Transaction.MorpheusTransaction;
import { IMorpheusState } from "./MorpheusState";


export class MorpheusTransactionHandler extends Handlers.TransactionHandler {
  public constructor(private state: IMorpheusState) 
  {
    super();
  }

  public getConstructor(): typeof Transactions.Transaction {
    return Transaction.MorpheusTransaction;
  }

  public dependencies(): readonly Handlers.TransactionHandlerConstructor[] {
    return [];
  }

  public walletAttributes(): readonly string[] {
    return [];
  }

  public bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async isActivated(): Promise<boolean> {
    return true;
  }

  public async applyToRecipient(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
    // nothing to do here
  }

  public async revertForRecipient(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
    // nothing to do here
  }
}