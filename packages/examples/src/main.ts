import { Managers, Transactions } from '@arkecosystem/crypto';
import { MorpheusTransaction } from '@internet-of-people/did-manager';
import { Api } from './api';
import { BeforeProof, Key, Right, Tombstone, Transfer, Vault } from './actions';
import { askForNetwork, chooseAction } from './utils';

const { Transaction } = MorpheusTransaction;

const rootActions = [ BeforeProof, Key, Right, Tombstone, Transfer, Vault ];

const asyncRun = async(): Promise<void> => {
  const rootAction = await chooseAction(rootActions, process.argv[2]);

  if (rootAction && !rootAction.ignoreNetwork) {
    const network = await askForNetwork();
    Api.create(network);

    const [ cryptoConfig, height ] = await Promise.all([
      Api.get().getNodeCryptoConfig(),
      Api.get().getCurrentHeight(),
    ]);

    Managers.configManager.setConfig(cryptoConfig);
    Managers.configManager.setHeight(height);
    Transactions.TransactionRegistry.registerTransactionType(Transaction.MorpheusTransaction);
  }

  await rootAction.run();
};

asyncRun().catch((e) => {
  return console.log('error: ', e);
});
