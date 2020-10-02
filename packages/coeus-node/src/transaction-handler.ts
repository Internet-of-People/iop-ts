import { app } from '@arkecosystem/core-container';
import { Database, State, TransactionPool } from '@arkecosystem/core-interfaces';
import { Interfaces as CryptoIf, Transactions } from '@arkecosystem/crypto';
import { Handlers } from '@arkecosystem/core-transactions';
import {
  READER_FACTORY_COMPONENT_NAME,
  ITransactionReader,
  TransactionReaderFactory,
  IAppLog,
  COEUS_LOGGER_COMPONENT_NAME,
} from '@internet-of-people/hydra-plugin-core';
import { CoeusTransaction } from './transaction';

export class TransactionHandler extends Handlers.TransactionHandler {
  public getConstructor(): typeof Transactions.Transaction {
    return CoeusTransaction;
  }

  public dependencies(): readonly Handlers.TransactionHandlerConstructor[] {
    return [];
  }

  public walletAttributes(): readonly string[] {
    return [];
  }

  public async bootstrap(connection: Database.IConnection, _: State.IWalletManager): Promise<void> {
    const logger: IAppLog = app.resolve(COEUS_LOGGER_COMPONENT_NAME);
    logger.info('Bootstrapping Morpheus plugin...');

    // Note: here we assume that when a block is reverted, the fact of the revert is NOT stored in the database.
    // This means, when a node is bootstrapped from scratch, it will not see any reverted blocks.
    const readerFactory: TransactionReaderFactory = app.resolve(READER_FACTORY_COMPONENT_NAME);
    const reader: ITransactionReader = await readerFactory(connection, this.getConstructor());

    while (reader.hasNext()) {
      const transactions = await reader.read();
      logger.debug(`Processing ${transactions.length} transactions in batch...`);

      for (const transaction of transactions) {
        // TODO
        console.log(transaction);
      }
    }
  }

  public async canEnterTransactionPool(
    _data: CryptoIf.ITransactionData,
    _pool: TransactionPool.IConnection,
    _processor: TransactionPool.IProcessor,
  ): Promise<{ type: string; message: string; } | null> {
    return null;
  }

  public async isActivated(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public async applyToRecipient(
    _transaction: CryptoIf.ITransaction,
    _walletManager: State.IWalletManager,
  ): Promise<void> {
    // nothing to do here
  }

  public async revertForRecipient(
    _transaction: CryptoIf.ITransaction,
    _walletManager: State.IWalletManager,
  ): Promise<void> {
    // nothing to do here
  }
}
