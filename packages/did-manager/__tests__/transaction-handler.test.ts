import { asValue } from 'awilix';
import Optional from 'optional-js';
import { app } from '@arkecosystem/core-container';
import { Database, State, TransactionPool } from '@arkecosystem/core-interfaces';
import { Managers, Transactions, Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { Wallets } from '@arkecosystem/core-state';

import { Crypto, Layer1, Types } from '@internet-of-people/sdk';
import {
  IAppLog,
  ITransactionReader,
  MORPHEUS_LOGGER_COMPONENT_NAME,
  READER_FACTORY_COMPONENT_NAME,
} from '@internet-of-people/hydra-plugin-core';

import { TransactionHandler } from '../src/node/transaction-handler';
import {
  IBlockHeightChange,
  IMorpheusStateHandler,
  IStateChange,
  MORPHEUS_STATE_HANDLER_COMPONENT_NAME,
} from '../src/interfaces/morpheus';

class Fixture {
  public logMock = {
    appName: 'hot-wallet-tests',
    debug: jest.fn<void, [string]>(),
    info: jest.fn<void, [string]>(),
    warn: jest.fn<void, [string]>(),
    error: jest.fn<void, [string]>(),
  };
  public log = this.logMock as IAppLog;

  public stateHandlerMock = {
    query: {
      lastSeenBlockHeight: jest.fn<number, []>(),
      beforeProofExistsAt: jest.fn<boolean, [string, number|undefined]>(),
      getBeforeProofHistory: jest.fn<Types.Layer2.IBeforeProofHistory, [string]>(),
      isConfirmed: jest.fn<Optional<boolean>, [string]>(),
      getDidDocumentAt: jest.fn<Types.Layer2.IDidDocument, [Crypto.Did, number]>(),
      getDidTransactionIds: jest.fn<Types.Layer2.ITransactionIdHeight[], [Crypto.Did, boolean, number, number]>(),
    },
    applyEmptyBlockToState: jest.fn<void, [IBlockHeightChange]>(),
    applyTransactionToState: jest.fn<void, [IStateChange]>(),
    revertEmptyBlockFromState: jest.fn<void, [IBlockHeightChange]>(),
    revertTransactionFromState: jest.fn<void, [IStateChange]>(),
    dryRun: jest.fn<Types.Layer2.IDryRunOperationError[], [Types.Layer1.IOperationData[]]>(),
  };
  public stateHandler = this.stateHandlerMock as IMorpheusStateHandler;

  public transactionReaderMock = {
    hasNext: jest.fn<boolean, []>(),
    read: jest.fn<Promise<Database.IBootstrapTransaction[]>, []>(),
  };
  public transactionReader = this.transactionReaderMock as ITransactionReader;

  public constructor() {
    try {
      app.register(MORPHEUS_STATE_HANDLER_COMPONENT_NAME, asValue(this.stateHandler));
      app.register(READER_FACTORY_COMPONENT_NAME, asValue(() => {
        return this.transactionReader;
      }));
      app.register(MORPHEUS_LOGGER_COMPONENT_NAME, asValue(this.log));
    } catch (e) {
      console.log(`Error in fixture setup: ${e}`);
    }
  }

  public createSut(): TransactionHandler {
    return new TransactionHandler();
  }

  public mockTransactionReader(txns: Database.IBootstrapTransaction[]): void {
    this.transactionReaderMock.hasNext.mockImplementationOnce(() => {
      return true;
    });
    this.transactionReaderMock.read.mockImplementationOnce(async() => {
      return txns;
    });
  }

  public createBootstrapTx(
    props: Partial<Database.IBootstrapTransaction>,
    ops: Types.Layer1.IOperationData[],
  ): Database.IBootstrapTransaction {
    const asset: Types.Layer1.IMorpheusAsset = {
      operationAttempts: [...ops],
    };
    return {
      id: 'txId',
      version: 2,
      timestamp: 0,
      senderPublicKey: 'sender',
      recipientId: '',
      fee: '0.2',
      amount: '4',
      vendorField: '',
      asset,
      blockId: 'blockId',
      blockGeneratorPublicKey: 'forger',
      blockHeight: 42,
      blockReward: '5',
      ...props,
    };
  }
}

beforeAll(() => {
  Managers.configManager.setFromPreset('testnet');
  Managers.configManager.setHeight(2);
  Transactions.TransactionRegistry.registerTransactionType(Layer1.MorpheusTransaction);
});

describe('TransactionHandler', () => {
  let fixture: Fixture;
  let txHandler: TransactionHandler;
  beforeEach(() => {
    fixture = new Fixture();
    txHandler = fixture.createSut();
  });

  it('bootstrap', async() => {
    fixture.mockTransactionReader([
      fixture.createBootstrapTx({}, []),
    ]);

    const connection = {} as unknown as Database.IConnection;
    const walletManager = {} as unknown as State.IWalletManager;
    await txHandler.bootstrap(connection, walletManager);

    /* eslint @typescript-eslint/unbound-method: 0 */
    expect(fixture.stateHandler.applyTransactionToState).toBeCalledTimes(1);
  });

  describe('canEnterTransactionPool', () => {
    const processor: Partial<TransactionPool.IProcessor> = { pushError: jest.fn() };
    const pool: Partial<TransactionPool.IConnection> = {
      walletManager: new Wallets.WalletManager(),
      getTransactionsByType: async(): Promise<Set<CryptoIf.ITransaction>> => {
        return new Set();
      },
    };

    it('should not throw if the transaction is correct', async() => {
      const ops = new Layer1.OperationAttemptsBuilder()
        .registerBeforeProof('my content id')
        .getAttempts();
      const transaction = new Layer1.MorpheusTransactionBuilder()
        .fromOperationAttempts(ops)
        .nonce('42')
        .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire')
        .getStruct();

      await expect(txHandler.canEnterTransactionPool(
        transaction,
        pool as TransactionPool.IConnection,
        processor as TransactionPool.IProcessor,
      )).resolves.toBeNull();
    });

    it('should throw if the transaction was sent with low fee set', async() => {
      const ops = new Layer1.OperationAttemptsBuilder()
        .registerBeforeProof('my content id')
        .getAttempts();
      const expectedFee = Layer1.MorpheusTransactionBuilder.calculateFee(ops);
      const transaction = new Layer1.MorpheusTransactionBuilder()
        .fromOperationAttempts(ops)
        .fee('42')
        .nonce('42')
        .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire')
        .getStruct();

      await expect(txHandler.canEnterTransactionPool(
        transaction,
        pool as TransactionPool.IConnection,
        processor as TransactionPool.IProcessor,
      )).resolves.toStrictEqual({
        type: 'ERR_LOW_FEE',
        message: `The fee for this transaction must be at least ${expectedFee}`,
      });
    });
  });
});

