import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { EventEmitter } from 'events';
import { IAppLog} from '../src/app-log';
import { MorpheusArkConnector } from '../src/ark-connector';
import { IBlockEventSource, IBlockListener } from '../src/block-event-source';
import { MorpheusEvents } from '../src/state-interfaces';

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

  it('subscribes on init', async () => {
    expect(fixture.blockEventSourceMock.subscribe).not.toHaveBeenCalled();
    expect(fixture.eventEmitter.listenerCount(MorpheusEvents.StateCorrupted)).toBe(0);

    await arkConnector.init();
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.subscribe).toHaveBeenCalledWith(MorpheusArkConnector.SUBSCRIPTION_ID, fixture.blockListener);
    expect(fixture.eventEmitter.listenerCount(MorpheusEvents.StateCorrupted)).toBe(1);
  });
  it('unsubscribes on corrupted event', async () => {
    await arkConnector.init();

    expect(fixture.blockEventSourceMock.unsubscribe).not.toHaveBeenCalled();
    fixture.eventEmitter.emit(MorpheusEvents.StateCorrupted);
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledTimes(1);
    expect(fixture.blockEventSourceMock.unsubscribe).toHaveBeenCalledWith(MorpheusArkConnector.SUBSCRIPTION_ID);
  });
});

class Fixture {

  public eventEmitter: NodeJS.EventEmitter;

  public logMock = {
    appName: 'ark-connector.test',
    debug: jest.fn<void, [any]>(),
    info: jest.fn<void, [any]>(),
    warn: jest.fn<void, [any]>(),
    error: jest.fn<void, [any]>(),
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
  constructor() {
    this.eventEmitter = new EventEmitter();
  }
}
