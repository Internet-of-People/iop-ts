import { Container, Database } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import Optional from 'optional-js';
import { asValue } from 'awilix';
import { Server as HapiServer } from '@hapi/hapi';

import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { Types, Utils } from '@internet-of-people/sdk';
type TransactionId = Types.Sdk.TransactionId;

import { MorpheusArkConnector } from './ark-connector';
import { BlockEventSource } from './block-event-source';
import { BlockHandler } from './block-handler';
import { schedule } from './scheduler';
import { Layer2API } from './layer2-api';
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
  private readonly log: Utils.IAppLog;
  private readonly subcomponents: IInitializable[];

  public constructor(log: Utils.IAppLog, ...subcomponents: IInitializable[]) {
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

const attachHTTPApi = async(
  container: Container.IContainer,
  stateHandler: Interfaces.IMorpheusStateHandler,
  log: Utils.IAppLog,
): Promise<void> => {
  log.info('Trying to attach Morpheus HTTP API...');

  const api = container.resolvePlugin('api');

  if (!api) {
    setTimeout(() => {
      attachHTTPApi(container, stateHandler, log)
        .catch((err) => {
          return log.error(`Error attaching Morpheus HTTP API: ${err}`);
        });
    }, 1000);
    return;
  }

  const database: Database.IDatabaseService = container.resolvePlugin('database');
  const transactionRepository: Database.ITransactionsBusinessRepository = database.transactionsBusinessRepository;
  const txDb = {
    getMorpheusTransaction: async(txId: TransactionId): Promise<Optional<Types.Layer1.IMorpheusAsset>> => {
      const txDetails: CryptoIf.ITransactionData = await transactionRepository.findById(txId);
      const morpheusTx = txDetails as Types.Layer1.IMorpheusData;
      return Optional.ofNullable(morpheusTx?.asset);
    },
  };

  const http: HapiServer = api.instance('http');
  const layer2API = new Layer2API(log, stateHandler, http, txDb);
  await layer2API.init();
  log.info('HTTP API READY');
};

// TODO: separate register's content into a container, hence it can be tested
const register = async(container: Container.IContainer): Promise<Composite> => {
  const log = new Utils.AppLog(container.resolvePlugin('logger'));

  log.info('Starting up Morpheus');
  const eventEmitter: NodeJS.EventEmitter = container.resolvePlugin('event-emitter');
  const blockEventSource = new BlockEventSource(
    log,
    eventEmitter,
    schedule,
  );

  // Cannot inject MorpheusTransactionHandler with the following values
  // (the framework instantiates the handlers). We have to put its dependencies
  // into the container, so the transaction handler can resolve them from there.
  log.info('Creating State Handler');
  const stateHandler = new MorpheusStateHandler(log, eventEmitter);
  container.register(READER_FACTORY_COMPONENT_NAME, asValue(transactionReaderFactory));
  container.register(Interfaces.MORPHEUS_STATE_HANDLER_COMPONENT_NAME, asValue(stateHandler));
  container.register(Utils.LOGGER_COMPONENT_NAME, asValue(log));

  const blockHandler = new BlockHandler(stateHandler, log);

  const arkConnector = new MorpheusArkConnector(
    eventEmitter,
    log,
    blockHandler,
    blockEventSource,
  );

  log.info('Initializing Components');
  const composite = new Composite(log, arkConnector, blockEventSource);
  await composite.init();

  await attachHTTPApi(container, stateHandler, log);

  log.info('Registering MorpheusTransactionHandler');
  Handlers.Registry.registerTransactionHandler(MorpheusTransactionHandler);
  return composite;
};

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
