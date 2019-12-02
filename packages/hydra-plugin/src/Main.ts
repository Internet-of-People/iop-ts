import { Container } from "@arkecosystem/core-interfaces";

import { Handlers } from '@arkecosystem/core-transactions';
import { AppLog, IAppLog } from "./AppLog";
import {BlockHandler} from "./block-handler";
import { BlockEventSource } from "./BlockEventSource";
import { MorpheusTransactionHandler } from './MorpheusTransactionHandler';
import { NativeScheduler } from "./Scheduler";
import { Server } from "./Server";
import {MorpheusStateHandler} from "./state-handler";

export interface IInitializable {
  init(): Promise<void>;
}

export class Composite implements IInitializable {
  private log: IAppLog;
  private subcomponents: IInitializable[];

  public constructor(log: IAppLog, ...subcomponents: IInitializable[]) {
    this.log = log;
    this.subcomponents = subcomponents;
  }

  public exit() {
    this.log.info('stopped.');
  }

  public async init(): Promise<void> {
    this.log.info('Initializing');
    for (const component of this.subcomponents) {
      await component.init();
    }
    this.log.info('Has been started');
  }
}

const register = async (container: Container.IContainer) => {
  const log = new AppLog(container.resolvePlugin('logger'));
  log.info(`Starting up`);
  const eventEmitter: NodeJS.EventEmitter = container.resolvePlugin('event-emitter');
  // const db: Database.IDatabaseService = container.resolvePlugin('database');
  const blockEventSource = new BlockEventSource(
    log,
    eventEmitter,
    NativeScheduler.schedule
  );

  // TODO: try to remove singleton pattern and use DI (maybe awilix)
  MorpheusStateHandler.instance().logger = log;

  const server = new Server("0.0.0.0", 4705, log);

  const blockHandler = new BlockHandler();
  blockEventSource.subscribe('Morpheus block-handler', blockHandler);

  const plugin = new Composite(log, blockEventSource, server);
  await plugin.init();

  Handlers.Registry.registerTransactionHandler(MorpheusTransactionHandler);
  return plugin;
};

const deregister = async (container: Container.IContainer) => {
  return container.resolvePlugin(plugin.alias).exit();
};

export const defaults = {
};

export const plugin: Container.IPluginDescriptor = {
  pkg: require("../package.json"),
  required: true,
  defaults,
  alias: "morpheus-hydra-plugin",
  register,
  deregister,
};
