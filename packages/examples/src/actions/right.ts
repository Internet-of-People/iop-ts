import inquirer = require('inquirer');
import { MorpheusTransaction, Interfaces as DidInterfaces } from '@internet-of-people/did-manager';
import { IAction } from '../action';
import { processMorpheusTx } from '../transaction-sender';
import { chooseAction, dumpDids, askDid, dumpKeyIds, askAuth, askSignerKeyId, askHeight } from '../utils';
import { loadVault } from '../vault';
import { Layer2Api } from '../layer2api';

const {
  Operations: { OperationAttemptsBuilder, DidDocument: { ALL_RIGHTS } },
} = MorpheusTransaction;

const askRight = async(): Promise<DidInterfaces.Right> => {
  const { right }: { right: DidInterfaces.Right; } = await inquirer.prompt([{
    type: 'list',
    name: 'right',
    choices: ALL_RIGHTS.map((r) => {
      return { name: r.toString(), value: r };
    }),
  }]);
  return right;
};

const addRight = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('change rights on');

  dumpKeyIds(vaultIds);
  const auth = await askAuth('add a right to');
  const right = await askRight();
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .addRight(did, auth, right)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Add right');
};

const revokeRight = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('change rights on');

  dumpKeyIds(vaultIds);
  const auth = await askAuth('revoke a right from');
  const right = await askRight();
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .revokeRight(did, auth, right)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Revoke right');
};

const queryRight = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('query a right on');
  // const right = await askRight();
  const height = await askHeight();

  const document = await Layer2Api.get().getDidDocument(did, height);
  console.log(JSON.stringify(document.toData(), null, 2));
};

const run = async(): Promise<void> => {
  const subActions: IAction[] = [
    {
      id: 'add',
      run: addRight,
    },
    {
      id: 'revoke',
      run: revokeRight,
    },
    {
      id: 'query',
      run: queryRight,
    },
  ];
  const subAction = await chooseAction(subActions, process.argv[3]);
  await subAction.run();
};

const Right: IAction = {
  id: 'right',
  run,
};

export { Right };
