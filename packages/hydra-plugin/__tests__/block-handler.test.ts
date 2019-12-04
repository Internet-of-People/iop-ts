import { Interfaces as CryptoIf, Utils } from "@arkecosystem/crypto";
import { MorpheusTransaction } from "@internet-of-people/did-manager";
import {IBlockEventSource, IBlockListener} from "../src/block-event-source";
import { BlockHandler } from "../src/block-handler";
import { MorpheusStateHandler } from "../src/state-handler";
const { Transaction: { MorpheusTransaction: { type, typeGroup } } } = MorpheusTransaction;

describe('BlockHandler', () => {
  let blockHandler: BlockHandler;
  let fixture: Fixture;

  beforeEach(() => {
    fixture = new Fixture();
    blockHandler = new BlockHandler(fixture.blockEventSource);
  });

  it('subscribes on init', () => {
    expect(fixture.blockEventSourceMock.subscribe).not.toHaveBeenCalled();

    blockHandler.init();
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledWith(BlockHandler.SUBSCRIPTION_ID, blockHandler);
  });
  it('unsubscribes after a revert if it made the state corrupt', () => {
    blockHandler.init();

    // TODO: its not enough, has to be mocked higher level as somewhere deep it requires logger...
    MorpheusStateHandler.instance().isCorrupted = (): boolean => false;
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledWith(BlockHandler.SUBSCRIPTION_ID, blockHandler);
    expect(fixture.blockEventSourceMock.unsubscribe).not.toHaveBeenCalled();

    // TODO this way of setting corrupted state conflicts with check at block-handler.ts:onBlockReverted():43
    MorpheusStateHandler.instance().isCorrupted = (): boolean => true;
    blockHandler.onBlockReverted(fixture.getBlock());
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledWith(BlockHandler.SUBSCRIPTION_ID);
  });
  it('unsubscribes after an apply if the state is corrupt', () => {
    blockHandler.init();

    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledWith(BlockHandler.SUBSCRIPTION_ID, blockHandler);
    expect(fixture.blockEventSourceMock.unsubscribe).not.toHaveBeenCalled();

    blockHandler.onBlockApplied(fixture.getBlock());
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledWith(BlockHandler.SUBSCRIPTION_ID);
  });
});

class Fixture {
  public blockEventSourceMock = {
    init: jest.fn<Promise<void>, []>(),
    subscribe: jest.fn<void, [string, IBlockListener]>(),
    unsubscribe: jest.fn<void, [string]>(),
  };
  public blockEventSource = this.blockEventSourceMock as IBlockEventSource;

  public getBlock(): CryptoIf.IBlockData {
    const tx = { type, typeGroup } as CryptoIf.ITransactionData;
    return {
      generatorPublicKey: "",
      height: 0,
      numberOfTransactions: 0,
      payloadHash: "",
      payloadLength: 0,
      previousBlock: "",
      reward: Utils.BigNumber.ZERO,
      timestamp: 0,
      totalAmount: Utils.BigNumber.ZERO,
      totalFee: Utils.BigNumber.ZERO,
      version: 0,
      transactions: [tx]
    }
  };
}
