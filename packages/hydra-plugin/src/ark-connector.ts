import { IAppLog } from './app-log';
import { IBlockEventSource } from './block-event-source';
import { BlockHandler, IBlockHandler } from './block-handler';
import { IInitializable } from './main';
import { MorpheusEvents } from './state-interfaces';

export class MorpheusArkConnector implements IInitializable{
  constructor(
    private eventEmitter: NodeJS.EventEmitter,
    private log: IAppLog,
    private blockHandler: IBlockHandler,
    private blockEventSource: IBlockEventSource,
  ){}

  public async init(): Promise<void> {
    this.log.info('Starting up');

    this.blockEventSource.subscribe(BlockHandler.SUBSCRIPTION_ID, this.blockHandler);

    this.eventEmitter.on(MorpheusEvents.StateCorrupted, () => {
      this.blockEventSource.unsubscribe(BlockHandler.SUBSCRIPTION_ID);
      this.log.error('State is corrupted, BlockHandler is unsubscribed');
    });
  }
}
