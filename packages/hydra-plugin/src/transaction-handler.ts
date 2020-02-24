import { app } from '@arkecosystem/core-container';
import { Database, State, TransactionPool } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import { Interfaces as CryptoIf, Transactions } from '@arkecosystem/crypto';

import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { COMPONENT_NAME as LOGGER_COMPONENT, IAppLog } from '@internet-of-people/logger';

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
    const stateHandler: Interfaces.IMorpheusStateHandler = app.resolve(
      Interfaces.MORPHEUS_STATE_HANDLER_COMPONENT_NAME,
    );

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
  ): Promise<{ type: string; message: string; } | null> {
    // TODO: check if the fee is at least the calculated fee
    return Promise.resolve(null);
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
