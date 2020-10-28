import { Container, Database } from '@arkecosystem/core-interfaces';
import { Handlers } from '@arkecosystem/core-transactions';
import { asValue } from 'awilix';
import { Server as HapiServer } from '@hapi/hapi';
import Optional from 'optional-js';

import { Interfaces, MorpheusNode, MorpheusTransaction } from '@internet-of-people/did-manager';
import * as CoeusNode from '@internet-of-people/coeus-node';
import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import {
  AppLog,
  COEUS_LOGGER_COMPONENT_NAME,
  HYDRA_LOGGER_COMPONENT_NAME,
  IAppLog,
  IInitializable,
  MORPHEUS_LOGGER_COMPONENT_NAME,
  READER_FACTORY_COMPONENT_NAME,
  transactionReaderFactory,
} from '@internet-of-people/hydra-plugin-core';
import { Types } from '@internet-of-people/sdk';

import { ArkConnector } from './ark-connector';
import { BlockEventSource } from './block-event-source';
import { schedule } from './scheduler';

const { MorpheusStateHandler: { MorpheusStateHandler } } = MorpheusTransaction;
type TransactionId = Types.Sdk.TransactionId;

const PLUGIN_ALIAS = 'hydra-plugin';

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

const attachMorpheusApi = async(
  container: Container.IContainer,
  stateHandler: Interfaces.IMorpheusStateHandler,
  morpheusLog: IAppLog,
): Promise<void> => {
  const api = container.resolvePlugin('api');

  const database: Database.IDatabaseService = container.resolvePlugin('database');
  const transactionRepository: Database.ITransactionsBusinessRepository = database.transactionsBusinessRepository;

  const http: HapiServer = api.instance('http');

  const morpheusAPI = new MorpheusNode.MorpheusAPI(morpheusLog, stateHandler, {
    getMorpheusTransaction: async(txId: TransactionId): Promise<Optional<Types.Layer1.IMorpheusAsset>> => {
      const txDetails: CryptoIf.ITransactionData = await transactionRepository.findById(txId);
      const morpheusTx = txDetails as Types.Layer1.IMorpheusData;
      return Optional.ofNullable(morpheusTx?.asset);
    },
  });
  await morpheusAPI.init(http);
  morpheusLog.info('Morpheus HTTP API READY');
};

const attachCoeusApi = async(
  container: Container.IContainer,
  stateHandler: CoeusNode.StateHandler,
  coeusLog: IAppLog,
): Promise<void> => {
  const api = container.resolvePlugin('api');
  const http: HapiServer = api.instance('http');

  const coeusAPI = new CoeusNode.CoeusAPI(coeusLog, stateHandler);
  await coeusAPI.init(http);
  coeusLog.info('Coeus HTTP API READY');
};

// TODO: separate register's content into a container, hence it can be tested
const register = async(container: Container.IContainer): Promise<Composite> => {
  const logger = container.resolvePlugin('logger');
  const hydraLog = new AppLog(logger, 'HYDRA');
  const morpheusLog = new AppLog(logger, 'MORPHEUS');
  const coeusLog = new AppLog(logger, 'COEUS');

  hydraLog.info('Starting up Hydra Plugin...');
  const eventEmitter: NodeJS.EventEmitter = container.resolvePlugin('event-emitter');
  const blockEventSource = new BlockEventSource(
    hydraLog,
    eventEmitter,
    schedule,
  );

  container.register(READER_FACTORY_COMPONENT_NAME, asValue(transactionReaderFactory));
  container.register(HYDRA_LOGGER_COMPONENT_NAME, asValue(hydraLog));
  container.register(MORPHEUS_LOGGER_COMPONENT_NAME, asValue(morpheusLog));
  container.register(COEUS_LOGGER_COMPONENT_NAME, asValue(coeusLog));

  // Cannot inject MorpheusStateHandler with the following values
  // (the framework instantiates the handlers). We have to put its dependencies
  // into the container, so the transaction handler can resolve them from there.
  hydraLog.info('Creating Morpheus handlers...');
  const morpheusStateHandler = new MorpheusStateHandler(morpheusLog, eventEmitter);
  const coeusStateHandler = new CoeusNode.StateHandler(coeusLog);
  container.register(Interfaces.MORPHEUS_STATE_HANDLER_COMPONENT_NAME, asValue(morpheusStateHandler));
  container.register(CoeusNode.StateHandler.COMPONENT_NAME, asValue(coeusStateHandler));

  const morpheusBlockHandler = new MorpheusNode.BlockHandler(morpheusStateHandler, morpheusLog);
  const coeusBlockHandler = new CoeusNode.BlockHandler(coeusStateHandler, coeusLog);

  const arkConnector = new ArkConnector(
    eventEmitter,
    hydraLog,
    [
      { subscriptionId: 'morpheus-block-listener', listener: morpheusBlockHandler },
      { subscriptionId: 'coeus-block-listener', listener: coeusBlockHandler },
    ],
    blockEventSource,
  );

  hydraLog.info('Initializing Components');
  const composite = new Composite(hydraLog, arkConnector, blockEventSource);
  await composite.init();

  hydraLog.info('Registering MorpheusTransactionHandler');
  Handlers.Registry.registerTransactionHandler(MorpheusNode.TransactionHandler);
  hydraLog.info('Registering CoeusTransactionHandler');
  Handlers.Registry.registerTransactionHandler(CoeusNode.TransactionHandler);

  /* eslint @typescript-eslint/no-misused-promises: 0 */
  eventEmitter.on('wallet.api.started', async() => {
    await Promise.all([
      await attachMorpheusApi(container, morpheusStateHandler, morpheusLog),
      await attachCoeusApi(container, coeusStateHandler, coeusLog),
    ]);
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
