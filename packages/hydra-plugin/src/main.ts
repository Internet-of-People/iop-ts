import { Container } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import { AppLog, COMPONENT_NAME as LOGGER_COMPONENT, IAppLog } from '@internet-of-people/logger';
import { asValue } from 'awilix';
import { MorpheusArkConnector } from './ark-connector';
import { BlockEventSource } from './block-event-source';
import { BlockHandler } from './block-handler';
import { schedule } from './scheduler';
import { Server } from './server';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { MorpheusTransactionHandler } from './transaction-handler';
import {
  COMPONENT_NAME as READER_FACTORY_COMPONENT_NAME,
  transactionReaderFactory,
} from './transaction-reader-factory';

const { MorpheusStateHandler: { MorpheusStateHandler } } = MorpheusTransaction;

const PLUGIN_ALIAS = 'morpheus-hydra-plugin';

export interface IInitializable {
  init(): Promise<void>;
}

export class Composite implements IInitializable {
  private readonly log: IAppLog;
  private readonly subcomponents: IInitializable[];

  public constructor(log: IAppLog, ...subcomponents: IInitializable[]) {
    this.log = log;
    this.subcomponents = subcomponents;
  }

  public exit(): void {
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
const register = async(container: Container.IContainer): Promise<Composite> => {
  const log = new AppLog(container.resolvePlugin('logger'));

  log.info('Starting up');
  const eventEmitter: NodeJS.EventEmitter = container.resolvePlugin('event-emitter');
  const blockEventSource = new BlockEventSource(
    log,
    eventEmitter,
    schedule,
  );

  // Cannot inject MorpheusTransactionHandler with the following values
  // (the framework instantiates the handlers). We have to put its dependencies
  // into the container, so the transaction handler can resolve them from there.
  const stateHandler = new MorpheusStateHandler(log, eventEmitter);
  container.register(READER_FACTORY_COMPONENT_NAME, asValue(transactionReaderFactory));
  container.register(Interfaces.MORPHEUS_STATE_HANDLER_COMPONENT_NAME, asValue(stateHandler));
  container.register(LOGGER_COMPONENT, asValue(log));

  const server = new Server('0.0.0.0', 4705, log, stateHandler);
  const blockHandler = new BlockHandler(stateHandler, log);

  const arkConnector = new MorpheusArkConnector(
    eventEmitter,
    log,
    blockHandler,
    blockEventSource,
  );

  const composite = new Composite(log, arkConnector, blockEventSource, server);
  await composite.init();

  Handlers.Registry.registerTransactionHandler(MorpheusTransactionHandler);
  return composite;
};

/* eslint @typescript-eslint/require-await:0 */
const deregister = async(container: Container.IContainer): Promise<void> => {
  container.resolvePlugin<Composite>(PLUGIN_ALIAS).exit();
};

export const defaults = {
};

export const plugin: Container.IPluginDescriptor = {
  pkg: require('../package.json'),
  required: true,
  defaults,
  alias: PLUGIN_ALIAS,
  register,
  deregister,
};
