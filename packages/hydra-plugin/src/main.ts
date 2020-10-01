import { Container, Database } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import { asValue } from 'awilix';
import { Server as HapiServer } from '@hapi/hapi';
import Optional from 'optional-js';

import { Interfaces, MorpheusNode, MorpheusTransaction } from '@internet-of-people/did-manager';
import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import {
  IInitializable,
  READER_FACTORY_COMPONENT_NAME,
  transactionReaderFactory,
} from '@internet-of-people/hydra-plugin-core';
import { Types, Utils } from '@internet-of-people/sdk';

import { ArkConnector } from './ark-connector';
import { BlockEventSource } from './block-event-source';
import { schedule } from './scheduler';

const { MorpheusStateHandler: { MorpheusStateHandler } } = MorpheusTransaction;
type TransactionId = Types.Sdk.TransactionId;

const PLUGIN_ALIAS = 'hydra-plugin';

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
  const api = container.resolvePlugin('api');

  const database: Database.IDatabaseService = container.resolvePlugin('database');
  const transactionRepository: Database.ITransactionsBusinessRepository = database.transactionsBusinessRepository;

  const http: HapiServer = api.instance('http');

  const morpheusLayer2API = new MorpheusNode.Layer2API(log, stateHandler, http, {
    getMorpheusTransaction: async(txId: TransactionId): Promise<Optional<Types.Layer1.IMorpheusAsset>> => {
      const txDetails: CryptoIf.ITransactionData = await transactionRepository.findById(txId);
      const morpheusTx = txDetails as Types.Layer1.IMorpheusData;
      return Optional.ofNullable(morpheusTx?.asset);
    },
  });
  await morpheusLayer2API.init();
  log.info('Morpheus HTTP API READY');
};

// TODO: separate register's content into a container, hence it can be tested
const register = async(container: Container.IContainer): Promise<Composite> => {
  const log = new Utils.AppLog(container.resolvePlugin('logger'));

  log.info('Starting up Hydra Plugin...');
  const eventEmitter: NodeJS.EventEmitter = container.resolvePlugin('event-emitter');
  const blockEventSource = new BlockEventSource(
    log,
    eventEmitter,
    schedule,
  );

  container.register(READER_FACTORY_COMPONENT_NAME, asValue(transactionReaderFactory));
  container.register(Utils.LOGGER_COMPONENT_NAME, asValue(log));

  // Cannot inject MorpheusStateHandler with the following values
  // (the framework instantiates the handlers). We have to put its dependencies
  // into the container, so the transaction handler can resolve them from there.
  log.info('Creating Morpheus handlers...');
  const stateHandler = new MorpheusStateHandler(log, eventEmitter);
  container.register(Interfaces.MORPHEUS_STATE_HANDLER_COMPONENT_NAME, asValue(stateHandler));

  const morpheusBlockHandler = new MorpheusNode.BlockHandler(stateHandler, log);

  const arkConnector = new ArkConnector(
    eventEmitter,
    log,
    [
      { subscriptionId: 'morpheus-block-listener', listener: morpheusBlockHandler },
    ],
    blockEventSource,
  );

  log.info('Initializing Components');
  const composite = new Composite(log, arkConnector, blockEventSource);
  await composite.init();

  log.info('Registering MorpheusTransactionHandler');
  Handlers.Registry.registerTransactionHandler(MorpheusNode.TransactionHandler);

  /* eslint @typescript-eslint/no-misused-promises: 0 */
  eventEmitter.on('wallet.api.started', async() => {
    await attachHTTPApi(container, stateHandler, log);
  });

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
