import { app } from '@arkecosystem/core-container';
import { Database, State } from '@arkecosystem/core-interfaces';
import { Interfaces } from '@internet-of-people/did-manager';
import { asValue } from 'awilix';
import Optional from 'optional-js';
import { COMPONENT_NAME as LOGGER_COMPONENT, IAppLog } from '../src/app-log';
import { COMPONENT_NAME as STATE_HANDLER_COMPONENT, IMorpheusStateHandler, IStateChange } from '../src/state-handler';
import { MorpheusTransactionHandler } from '../src/transaction-handler';
import { COMPONENT_NAME as READER_FACTORY_COMPONENT, ITransactionReader } from '../src/transaction-reader-factory';

describe('TransactionHandler', () => {
  let fixture: Fixture;
  beforeEach(async () => {
    fixture = new Fixture();
  });

  it('container stuff', async () => {
    const txHandler = fixture.createSut();
    fixture.mockTransactionReader([
      fixture.createBootstrapTx({}, [])
    ]);

    const connection = {} as unknown as Database.IConnection;
    const walletManager = {} as unknown as State.IWalletManager;
    await txHandler.bootstrap(connection, walletManager);

    expect(fixture.stateHandler.applyTransactionToState).toBeCalledTimes(1);
  });
});

class Fixture {
  public logMock = {
    appName: 'hot-wallet-tests',
    debug: jest.fn<void, [any]>(),
    info: jest.fn<void, [any]>(),
    warn: jest.fn<void, [any]>(),
    error: jest.fn<void, [any]>(),
  };
  public log = this.logMock as IAppLog;

  public stateHandlerMock = {
    query: {
      beforeProofExistsAt: jest.fn<boolean, [string, number|undefined]>(),
      isConfirmed: jest.fn<Optional<boolean>, [string]>(),
      getDidDocumentAt: jest.fn<Interfaces.IDidDocument, [Interfaces.Did, number]>(),
    },
    applyTransactionToState: jest.fn<void, [IStateChange]>(),
    revertTransactionFromState: jest.fn<void, [IStateChange]>(),
  };
  public stateHandler = this.stateHandlerMock as IMorpheusStateHandler;

  public transactionReaderMock = {
    hasNext: jest.fn<boolean, []>(),
    read: jest.fn<Promise<Database.IBootstrapTransaction[]>, []>(),
  };
  public transactionReader = this.transactionReaderMock as ITransactionReader;

  public constructor() {
    try {
      app.register(STATE_HANDLER_COMPONENT, asValue(this.stateHandler));
      app.register(READER_FACTORY_COMPONENT, asValue(async () => this.transactionReader));
      app.register(LOGGER_COMPONENT, asValue(this.log));
    } catch (e) {
      console.log(`Error in fixture setup: ${e}`);
    }
  }

  public createSut(): MorpheusTransactionHandler {
    return new MorpheusTransactionHandler();
  }

  public mockTransactionReader(txns: Database.IBootstrapTransaction[]) {
    this.transactionReaderMock.hasNext.mockImplementationOnce(() => true);
    this.transactionReaderMock.read.mockImplementationOnce(async () => txns);
  }

  public createBootstrapTx(props: Partial<Database.IBootstrapTransaction>, ops: Interfaces.IOperationData[]): Database.IBootstrapTransaction {
    const asset: Interfaces.IMorpheusAsset = {
      operationAttempts: [...ops]
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
      ...props
    };
  }
}