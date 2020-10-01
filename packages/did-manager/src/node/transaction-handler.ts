import { app } from '@arkecosystem/core-container';
import { Database, State, TransactionPool } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import { Interfaces as CryptoIf, Transactions } from '@arkecosystem/crypto';

import {
  READER_FACTORY_COMPONENT_NAME,
  ITransactionReader,
  TransactionReaderFactory,
} from '@internet-of-people/hydra-plugin-core';

import { Layer1, Types, Utils } from '@internet-of-people/sdk';
import { IMorpheusStateHandler, MORPHEUS_STATE_HANDLER_COMPONENT_NAME } from '../interfaces/morpheus';

/**
 * Handles Morpheus custom transactions on Layer 1 (IWalletManager)
 */
export class TransactionHandler extends Handlers.TransactionHandler {
  public getConstructor(): typeof Transactions.Transaction {
    return Layer1.MorpheusTransaction;
  }

  public dependencies(): readonly Handlers.TransactionHandlerConstructor[] {
    return [];
  }

  public walletAttributes(): readonly string[] {
    return [];
  }

  public async bootstrap(connection: Database.IConnection, _: State.IWalletManager): Promise<void> {
    const logger: Utils.IAppLog = app.resolve(Utils.LOGGER_COMPONENT_NAME);
    logger.info('Bootstrapping Morpheus plugin...');

    // Note: here we assume that when a block is reverted, the fact of the revert is NOT stored in the database.
    // This means, when a node is bootstrapped from scratch, it will not see any reverted blocks.
    const readerFactory: TransactionReaderFactory = app.resolve(READER_FACTORY_COMPONENT_NAME);
    const reader: ITransactionReader = await readerFactory(connection, this.getConstructor());
    const stateHandler: IMorpheusStateHandler = app.resolve(
      MORPHEUS_STATE_HANDLER_COMPONENT_NAME,
    );

    while (reader.hasNext()) {
      const transactions = await reader.read();
      logger.debug(`Processing ${transactions.length} transactions in batch...`);

      for (const transaction of transactions) {
        stateHandler.applyTransactionToState({
          asset: transaction.asset as Types.Layer1.IMorpheusAsset,
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
    try {
      const asset = _data.asset as Types.Layer1.IMorpheusAsset;
      const expectedFee = Layer1.MorpheusTransactionBuilder.calculateFee(asset.operationAttempts);

      if (_data.fee.isLessThan(expectedFee)) {
        return {
          type: 'ERR_LOW_FEE',
          message: `The fee for this transaction must be at least ${expectedFee}`,
        };
      }

      return null;
    } catch (e) {
      return {
        type: 'ERR_INVALID_TX',
        message: e.message,
      };
    }
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
