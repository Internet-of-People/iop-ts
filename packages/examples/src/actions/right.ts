import inquirer = require('inquirer');

import { Crypto, Layer1, Layer2, Types } from '@internet-of-people/sdk';
import { IAction } from '../action';
import { processMorpheusTx } from '../transaction-sender';
import { chooseAction, dumpDids, askDid, dumpKeyIds, askAuth, askSignerKeyId, askHeight } from '../utils';
import { loadVault, unlockPassword } from '../vault';

const systemRights = new Layer2.SystemRights();

const askRight = async(): Promise<Types.Sdk.Right> => {
  const { right }: { right: Types.Sdk.Right; } = await inquirer.prompt([{
    type: 'list',
    name: 'right',
    choices: systemRights.all.map((r) => {
      return { name: r.toString(), value: r };
    }),
  }]);
  return right;
};

const addRight = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);

  dumpDids(m.pub.personas);
  const did = await askDid('change rights on');

  dumpKeyIds(m.pub.personas);
  const auth = await askAuth('add a right to');
  const right = await askRight();
  const signerKeyId = await askSignerKeyId(m.pub.personas);

  const lastTxId = await layer2Api.getLastTxId(did);
  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .signWith(m.priv(unlockPassword))
    .on(did, lastTxId)
    .addRight(auth, right)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Add right', layer1Api, layer2Api);
};

const revokeRight = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);

  dumpDids(m.pub.personas);
  const did = await askDid('change rights on');

  dumpKeyIds(m.pub.personas);
  const auth = await askAuth('revoke a right from');
  const right = await askRight();
  const signerKeyId = await askSignerKeyId(m.pub.personas);

  const lastTxId = await layer2Api.getLastTxId(did);
  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .signWith(m.priv(unlockPassword))
    .on(did, lastTxId)
    .revokeRight(auth, right)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Revoke right', layer1Api, layer2Api);
};

const queryRight = async(_: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);

  dumpDids(m.pub.personas);
  const did = await askDid('query a right on');
  // const right = await askRight();
  const height = await askHeight();

  const document = await layer2Api.getDidDocument(did, height);
  console.log(JSON.stringify(document.toData(), null, 2));
};

const run = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
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
  await subAction.run(layer1Api, layer2Api);
};

const Right: IAction = {
  id: 'right',
  run,
};

export { Right };
