import { Managers, Transactions } from '@arkecosystem/crypto';
import { MorpheusTransaction } from '@internet-of-people/did-manager';
import { Api } from './api';
import { BeforeProof, Key, Transfer, Vault } from './actions';
import { askForNetwork, chooseAction } from './utils';

const { Transaction } = MorpheusTransaction;

const rootActions = [ BeforeProof, Key, Transfer, Vault ];

const asyncRun = async(): Promise<void> => {
  const rootAction = await chooseAction(rootActions, process.argv[2]);

  if (rootAction && !rootAction.ignoreNetwork) {
    const network = await askForNetwork();
    Api.create(network);
    Managers.configManager.setConfig(await Api.get().getNodeCryptoConfig());
    Transactions.TransactionRegistry.registerTransactionType(Transaction.MorpheusTransaction);
  }

  await rootAction.run();
};

asyncRun().catch((e) => {
  return console.log('error: ', e);
});
