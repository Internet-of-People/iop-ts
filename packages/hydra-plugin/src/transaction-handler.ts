import { app } from '@arkecosystem/core-container';
import { Database, State, TransactionPool } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import { Interfaces as CryptoIf, Transactions } from '@arkecosystem/crypto';

import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { COMPONENT_NAME as LOGGER_COMPONENT, IAppLog } from './app-log';
import { COMPONENT_NAME as STATE_HANDLER_COMPONENT, IMorpheusStateHandler } from './state-handler';
import {
  COMPONENT_NAME as READER_FACTORY_COMPONENT,
  ITransactionReader,
  TransactionReaderFactory,
} from './transaction-reader-factory';

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

  public async bootstrap(connection: Database.IConnection, _: State.IWalletManager): Promise<void> {
    const logger: IAppLog = app.resolve(LOGGER_COMPONENT);
    logger.info('Bootstrapping Morpheus plugin...');

    // Note: here we assume that when a block is reverted, the fact of the revert is NOT stored in the database.
    // This means, when a node is bootstrapped from scratch, it will not see any reverted blocks.
    const readerFactory: TransactionReaderFactory = app.resolve(READER_FACTORY_COMPONENT);
    const reader: ITransactionReader = await readerFactory(connection, this.getConstructor());
    const stateHandler: IMorpheusStateHandler = app.resolve(STATE_HANDLER_COMPONENT);

    while (reader.hasNext()) {
      const transactions = await reader.read();
      logger.debug(`Processing ${transactions.length} transactions in batch...`);

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

  public async canEnterTransactionPool(
    _data: CryptoIf.ITransactionData,
    _pool: TransactionPool.IConnection,
    _processor: TransactionPool.IProcessor,
  ): Promise<boolean> {
    // TODO: check if the fee is at least the calculated fee
    return Promise.resolve(true);
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
