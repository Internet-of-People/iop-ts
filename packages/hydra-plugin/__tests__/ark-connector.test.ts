import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { IAppLog } from '@internet-of-people/logger';
import { Interfaces } from '@internet-of-people/did-manager';
import { EventEmitter } from 'events';
import { MorpheusArkConnector } from '../src/ark-connector';
import { IBlockEventSource, IBlockListener } from '../src/block-event-source';

class Fixture {
  public eventEmitter: NodeJS.EventEmitter;

  public logMock = {
    appName: 'ark-connector.test',
    debug: jest.fn<void, [string]>(),
    info: jest.fn<void, [string]>(),
    warn: jest.fn<void, [string]>(),
    error: jest.fn<void, [string]>(),
  };
  public log = this.logMock as IAppLog;

  public blockEventSourceMock = {
    init: jest.fn<Promise<void>, []>(),
    subscribe: jest.fn<void, [string, IBlockListener]>(),
    unsubscribe: jest.fn<void, [string]>(),
  };
  public blockEventSource = this.blockEventSourceMock as IBlockEventSource;

  public blockListenerMock = {
    onBlockApplied: jest.fn<Promise<void>, [CryptoIf.IBlockData]>(),
    onBlockReverted: jest.fn<Promise<void>, [CryptoIf.IBlockData]>(),
  };
  public blockListener = this.blockListenerMock as IBlockListener;

  public constructor() {
    this.eventEmitter = new EventEmitter();
  }
}

describe('ArkConnector', () => {
  let arkConnector: MorpheusArkConnector;
  let fixture: Fixture;

  beforeEach(() => {
    fixture = new Fixture();
    arkConnector = new MorpheusArkConnector(
      fixture.eventEmitter,
      fixture.log,
      fixture.blockListener,
      fixture.blockEventSource,
    );
  });

  it('subscribes on init', async() => {
    expect(fixture.blockEventSourceMock.subscribe).not.toHaveBeenCalled();
    expect(fixture.eventEmitter.listenerCount(Interfaces.MorpheusEvents.StateCorrupted)).toBe(0);

    await arkConnector.init();
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledWith(
      MorpheusArkConnector.SUBSCRIPTION_ID,
      fixture.blockListener,
    );
    expect(fixture.eventEmitter.listenerCount(Interfaces.MorpheusEvents.StateCorrupted)).toBe(1);
  });
  it('unsubscribes on corrupted event', async() => {
    await arkConnector.init();

    expect(fixture.blockEventSourceMock.unsubscribe).not.toHaveBeenCalled();
    fixture.eventEmitter.emit(Interfaces.MorpheusEvents.StateCorrupted);
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledWith(MorpheusArkConnector.SUBSCRIPTION_ID);
  });
});
