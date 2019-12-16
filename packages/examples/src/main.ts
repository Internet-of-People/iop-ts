import { Managers, Transactions, Utils } from '@arkecosystem/crypto';
import { MorpheusTransaction } from '@internet-of-people/did-manager';
import { Api } from './api';
import { IAction } from './action';
import { BeforeProof, Key, Transfer } from './actions';
import { askForNetwork } from './utils';

const { Transaction } = MorpheusTransaction;

const rootActions = [ BeforeProof, Key, Transfer ];

const chooseAction = (actions: IAction[], id?: string): IAction => {
  if (!id) {
    throw new Error('No example ID provided. Which one would you like to run?');
  }

  const action = actions.find((a) => {
    return a.id === id;
  });

  if (!action) {
    throw new Error(`Unknown example provided: ${id}`);
  }
  return action;
};

const asyncRun = async(): Promise<void> => {
  const rootAction = chooseAction(rootActions, process.argv[2]);

  const network = await askForNetwork();
  Api.create(network);
  Managers.configManager.setConfig(await Api.get().getNodeCryptoConfig());
  Transactions.TransactionRegistry.registerTransactionType(Transaction.MorpheusTransaction);

  await rootAction.run();
};

/* eslint @typescript-eslint/no-unused-vars: 0 */
const _ = Promise.resolve().then(asyncRun);
