import { Container } from "@arkecosystem/core-interfaces";

import { AppLog, IAppLog } from "./AppLog";
import { BlockEventSource } from "./BlockEventSource";
import { NativeScheduler } from "./Scheduler";

export interface IInitializable {
  init(): Promise<void>
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
  const blockEventSource = new BlockEventSource(
    log,
    eventEmitter,
    NativeScheduler.schedule
  );

  // const queue = new Queue();
  // const server = new Server(
  //   "0.0.0.0",
  //   4705,
  //   queue,
  // );

  const plugin = new Composite(log, blockEventSource)
  await plugin.init();
  return plugin;
}

const deregister = async (container: Container.IContainer) => {
  return container.resolvePlugin(plugin.alias).exit();
}

export const defaults = {
};

export const plugin: Container.IPluginDescriptor = {
  pkg: require("../package.json"),
  required: true,
  defaults,
  alias: "hydra-morpheus-plugin",
  register,
  deregister,
};
