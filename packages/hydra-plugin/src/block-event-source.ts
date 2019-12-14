import { ApplicationEvents } from '@arkecosystem/core-event-emitter';
import { Interfaces as CryptoIf } from '@arkecosystem/crypto';

import { IAppLog } from './app-log';
import { IInitializable } from './main';
import { Scheduler } from './scheduler';

export interface IBlockListener {
  onBlockApplied(block: CryptoIf.IBlockData): Promise<void>;
  onBlockReverted(block: CryptoIf.IBlockData): Promise<void>;
}

export interface IBlockEventSource extends IInitializable {
  subscribe(name: string, listener: IBlockListener): void;
  unsubscribe(name: string): void;
}

export class BlockEventSource implements IBlockEventSource {
  private listeners: [string, IBlockListener][];

  public constructor(
    private readonly log: IAppLog,
    private readonly emitter: NodeJS.EventEmitter,
    private readonly schedule: Scheduler,
  ) {
    this.listeners = [];
  }

  /* eslint @typescript-eslint/require-await: 0 */
  public async init(): Promise<void> {
    this.emitter.on(ApplicationEvents.BlockApplied, (block: CryptoIf.IBlockData) => {
      this.onBlockApplied(block);
    });
    this.emitter.on(ApplicationEvents.BlockReverted, (block: CryptoIf.IBlockData) => {
      this.onBlockReverted(block);
    });
  }

  public subscribe(name: string, listener: IBlockListener): void {
    if (!name) {
      throw new Error(`${this.log.appName} BlockEventSource.subscribe was called without a name`);
    }

    this.listeners.push([ name, listener ]);
  }

  public unsubscribe(listenerName: string): void {
    this.listeners = this.listeners.filter(([name]) => {
      return name !== listenerName;
    });
  }

  private onBlockApplied(block: CryptoIf.IBlockData): void {
    /* eslint @typescript-eslint/no-unnecessary-condition: 0*/
    if (!block) {
      this.log.error('BlockApplied was called without a block');
      return;
    }

    for (const [ name, listener ] of this.listeners) {
      this.schedule(this.log, `blockApplied: ${name} ${block.id}`, async() => {
        await listener.onBlockApplied(block);
      });
    }
  }

  private onBlockReverted(block: CryptoIf.IBlockData): void {
    if (!block) {
      this.log.error('BlockReverted was called without a block');
      return;
    }

    for (const [ name, listener ] of this.listeners) {
      this.schedule(this.log, `blockReverted: ${name} ${block.id}`, async() => {
        await listener.onBlockReverted(block);
      });
    }
  }
}
