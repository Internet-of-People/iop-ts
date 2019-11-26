import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { Interfaces as CryptoIf } from "@arkecosystem/crypto";

import { IAppLog } from "./AppLog";
import { IInitializable } from "./Main";
import { Scheduler } from "./Scheduler";

export interface IBlockListener {
  onBlockApplied(block: CryptoIf.IBlockData): Promise<void>;
  onBlockReverted(block: CryptoIf.IBlockData): Promise<void>;
}

export interface IBlockEventSource extends IInitializable {
  subscribe(name: string, listener: IBlockListener): void;
}

export class BlockEventSource implements IBlockEventSource {
  private listeners: Array<[string, IBlockListener]>;

  constructor(
    private readonly log: IAppLog,
    private readonly emitter: NodeJS.EventEmitter,
    private readonly schedule: Scheduler
  ) {
    this.listeners = [];
  }

  public async init(): Promise<void> {
    this.emitter.on(ApplicationEvents.BlockApplied, block => {
      this.onBlockApplied(block);
    });
    this.emitter.on(ApplicationEvents.BlockReverted, block => {
      this.onBlockReverted(block);
    });
  }

  public subscribe(name: string, listener: IBlockListener): void {
    if (!name) {
      throw new Error(`${this.log.appName} BlockEventSource.subscribe was called without a name`);
    }
    if (!listener) {
      throw new Error(`${this.log.appName} BlockEventSource.subscribe was called without a listener`);
    }
    this.listeners.push([name, listener]);
  }

  private onBlockApplied(block: CryptoIf.IBlockData): void {
    if (!block) {
      this.log.error("BlockApplied was called without a block");
      return;
    }
    for (const [name, listener] of this.listeners) {
      this.schedule(this.log, `blockApplied: ${name} ${block.id}`, () => listener.onBlockApplied(block));
    }
  }

  private onBlockReverted(block: CryptoIf.IBlockData): void {
    if (!block) {
      this.log.error("BlockReverted was called without a block");
      return;
    }
    for (const [name, listener] of this.listeners) {
      this.schedule(this.log, `blockReverted: ${name} ${block.id}`, () => listener.onBlockReverted(block));
    }
  }
}