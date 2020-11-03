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
import { CoeusTransaction, ICoeusAsset, ISignedBundle } from '@internet-of-people/coeus-proto';
import { StateHandler } from './state-handler';
import { SignedBundle } from '@internet-of-people/sdk-wasm';

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
    logger.info('Bootstrapping Coeus plugin...');

    // Note: here we assume that when a block is reverted, the fact of the revert is NOT stored in the database.
    // This means, when a node is bootstrapped from scratch, it will not see any reverted blocks.
    const readerFactory: TransactionReaderFactory = app.resolve(READER_FACTORY_COMPONENT_NAME);
    const reader: ITransactionReader = await readerFactory(connection, this.getConstructor());
    const stateHandler: StateHandler = app.resolve(StateHandler.COMPONENT_NAME);

    while (reader.hasNext()) {
      const transactions = await reader.read();
      logger.debug(`Processing ${transactions.length} transactions in batch...`);

      for (const transaction of transactions) {
        stateHandler.applyTransactionToState({
          asset: transaction.asset as ICoeusAsset,
          blockHeight: transaction.blockHeight,
          blockId: transaction.blockId,
          transactionId: transaction.id,
        });
      }
    }
  }

  public async canEnterTransactionPool(
    data: CryptoIf.ITransactionData,
    _pool: TransactionPool.IConnection,
    _processor: TransactionPool.IProcessor,
  ): Promise<{ type: string; message: string; } | null> {
    try {
      const stateHandler: StateHandler = app.resolve(StateHandler.COMPONENT_NAME);
      const bundles = data.asset!.bundles as ISignedBundle[];

      const expectedFee = bundles
        .map((signed) => {
          return new SignedBundle(signed).price(stateHandler.state).fee;
        })
        .reduce((total: BigInt, currentVal: BigInt) => {
          return BigInt(total) + BigInt(currentVal);
        });

      if (data.fee.isLessThan(expectedFee)) {
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
