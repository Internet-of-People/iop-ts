import { Managers, Transactions } from '@arkecosystem/crypto';
import { Layer1 } from '@internet-of-people/sdk';
import { Layer1Api } from './layer1api';
import { Layer2Api } from './layer2api';
import { BeforeProof, Key, Right, Tombstone, Transfer, Vault } from './actions';
import { askForNetwork, chooseAction } from './utils';

const rootActions = [ BeforeProof, Key, Right, Tombstone, Transfer, Vault ];

const asyncRun = async(): Promise<void> => {
  const rootAction = await chooseAction(rootActions, process.argv[2]);

  if (rootAction && !rootAction.ignoreNetwork) {
    const network = await askForNetwork();
    Layer1Api.create(network);
    Layer2Api.create(network);
    const [ cryptoConfig, height ] = await Promise.all([
      Layer1Api.get().getNodeCryptoConfig(),
      Layer1Api.get().getCurrentHeight(),
    ]);
    Managers.configManager.setConfig(cryptoConfig);
    Managers.configManager.setHeight(height);
    Transactions.TransactionRegistry.registerTransactionType(Layer1.MorpheusTransaction);
  }

  await rootAction.run();
};

asyncRun().catch((e) => {
  return console.log('error: ', e);
});
