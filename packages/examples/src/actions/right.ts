import inquirer = require('inquirer');
import { MorpheusTransaction, Interfaces as DidInterfaces } from '@internet-of-people/did-manager';
import { IAction } from '../action';
import { sendMorpheusTx } from '../transaction-sender';
import { chooseAction, dumpDids, askDid, dumpKeyIds, askAuth, askSignerKeyId } from '../utils';
import { loadVault } from '../vault';

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

  const id = await sendMorpheusTx(opAttempts);
  console.log(`Add right tx sent, id: ${id}`);
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

  const id = await sendMorpheusTx(opAttempts);
  console.log(`Revoke right tx sent, id: ${id}`);
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
  ];
  const subAction = await chooseAction(subActions, process.argv[3]);
  await subAction.run();
};

const Right: IAction = {
  id: 'right',
  run,
};

export { Right };
