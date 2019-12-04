import { app } from "@arkecosystem/core-container";
import { Database, State } from "@arkecosystem/core-interfaces";
import { Interfaces } from "@internet-of-people/did-manager";
import { asValue, asFunction } from "awilix";
import Optional from "optional-js";
import { MorpheusTransactionHandler } from "../src/transaction-handler";
import { COMPONENT_NAME as STATE_HANDLER_COMPONENT, IMorpheusStateHandler, IStateChange } from "../src/state-handler";
import { ITransactionReader, COMPONENT_NAME as READER_FACTORY_COMPONENT } from "../src/transaction-reader-factory";

describe('TransactionHandler', () => {
  let fixture: Fixture;
  beforeEach(async () => {
    fixture = new Fixture();
  });

  it('container stuff', async () => {
    let txHandler = fixture.createSut();
    fixture.mockTransactionReader([
      fixture.createBootstrapTx({}, [])
    ]);

    await txHandler.bootstrap({} as Database.IConnection, {} as State.IWalletManager);

    expect(fixture.stateHandler.applyTransactionToState).toBeCalledTimes(1);
  });
});

class Fixture {
  public stateHandlerMock = {
    query: {
      beforeProofExistsAt: jest.fn<boolean, [string, number|undefined]>(),
      isConfirmed: jest.fn<Optional<boolean>, [string]>(),
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
    } catch (error) {
      console.log(`Error in fixture setup: ${error.message}`);
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
    return {
      id: "txId",
      version: 2,
      timestamp: 0,
      senderPublicKey: "sender",
      recipientId: "",
      fee: "0.2",
      amount: "4",
      vendorField: "",
      asset: { operationAttempts: [...ops] } as Interfaces.IMorpheusAsset,
      blockId: "blockId",
      blockGeneratorPublicKey: "forger",
      blockHeight: 42,
      blockReward: "5",
      ...props
    }
  }
}