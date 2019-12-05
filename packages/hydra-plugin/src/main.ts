import { Container, Database } from "@arkecosystem/core-interfaces";
import { Handlers } from '@arkecosystem/core-transactions';
import { asValue } from "awilix";
import { AppLog, COMPONENT_NAME as LOGGER_COMPONENT, IAppLog } from "./app-log";
import { MorpheusArkConnector } from "./ark-connector";
import { BlockEventSource } from "./block-event-source";
import { BlockHandler } from "./block-handler";
import { NativeScheduler } from "./scheduler";
import { Server } from "./server";
import { COMPONENT_NAME as STATE_HANDLER_COMPONENT_NAME, MorpheusStateHandler } from "./state-handler";
import { MorpheusTransactionHandler } from './transaction-handler';
import { COMPONENT_NAME as READER_FACTORY_COMPONENT_NAME, transactionReaderFactory } from './transaction-reader-factory';

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

// TODO: separate register's content into a container, hence it can be tested
const register = async (container: Container.IContainer) => {
  const log = new AppLog(container.resolvePlugin('logger'));
  const db: Database.IDatabaseService = container.resolvePlugin('database');

  log.info(`Starting up`);
  const eventEmitter: NodeJS.EventEmitter = container.resolvePlugin('event-emitter');
  const blockEventSource = new BlockEventSource(
    log,
    eventEmitter,
    NativeScheduler.schedule
  );

  // Cannot inject MorpheusTransactionHandler with the following values
  // (the framework instantiates the handlers). We have to put its dependencies
  // into the container, so the transaction handler can resolve them from there.
  const stateHandler = new MorpheusStateHandler(log, eventEmitter);
  container.register(READER_FACTORY_COMPONENT_NAME, asValue(transactionReaderFactory));
  container.register(STATE_HANDLER_COMPONENT_NAME, asValue(stateHandler));
  container.register(LOGGER_COMPONENT, asValue(log));

  const server = new Server("0.0.0.0", 4705, log, stateHandler);
  const blockHandler = new BlockHandler(stateHandler, log, db.transactionsBusinessRepository);

  const arkConnector = new MorpheusArkConnector(
    eventEmitter,
    log,
    blockHandler,
    blockEventSource,
  );

  const plugin = new Composite(log, arkConnector, blockEventSource, server);
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
