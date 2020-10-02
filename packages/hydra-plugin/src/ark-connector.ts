import { Interfaces } from '@internet-of-people/did-manager';
import { IAppLog, IBlockEventSource, IBlockListener, IInitializable } from '@internet-of-people/hydra-plugin-core';

export interface IBlockSubscriber {
  subscriptionId: string;
  listener: IBlockListener;
}

export class ArkConnector implements IInitializable {
  public constructor(
    private readonly eventEmitter: NodeJS.EventEmitter,
    private readonly log: IAppLog,
    private readonly subscribers: IBlockSubscriber[],
    private readonly blockEventSource: IBlockEventSource,
  ) {}

  public async init(): Promise<void> {
    this.log.info('Starting up Ark Connector');

    for (const subscriber of this.subscribers) {
      this.blockEventSource.subscribe(subscriber.subscriptionId, subscriber.listener);

      this.eventEmitter.on(Interfaces.MorpheusEvents.StateCorrupted, () => {
        this.blockEventSource.unsubscribe(subscriber.subscriptionId);
        this.log.error('Morpheus\'s State is corrupted, BlockHandler is unsubscribed');
      });
    }
  }
}
