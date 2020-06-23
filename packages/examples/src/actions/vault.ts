import { Crypto } from '@internet-of-people/sdk';

/* eslint no-undefined: 0 */
import { IAction } from '../action';
import { chooseAction, keyIds } from '../utils';
import { initDemoVault, loadVault, saveVault, unlockPassword } from '../vault';

const initVault = async(): Promise<void> => {
  const vault = await initDemoVault();
  const m = Crypto.MorpheusPlugin.get(vault);
  const did = m.pub.personas.did(0);
  await saveVault(vault);
  console.log('Vault created, 1st did is', did.toString());
};

const createDid = async(): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);
  const priv = m.priv(unlockPassword);
  const did = priv.personas.did(priv.personas.count);
  await saveVault(vault);
  console.log('New did created', did.toString());
};

const listKeyIds = async(): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);
  keyIds(m.pub.personas).forEach((id, idx) => {
    console.log(`#${idx}: ${id}`);
  });
};

const listDids = async(): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);
  keyIds(m.pub.personas).map((id) => {
    return Crypto.Did.fromKeyId(id);
  })
    .forEach((did, idx) => {
      console.log(`#${idx}: ${did}`);
    });
};

const run = async(): Promise<void> => {
  const subActions: IAction[] = [
    {
      id: 'init',
      run: initVault,
    },
    {
      id: 'create',
      run: createDid,
    },
    {
      id: 'listKeyIds',
      run: listKeyIds,
    },
    {
      id: 'listDids',
      run: listDids,
    },
  ];
  const subAction = await chooseAction(subActions, process.argv[3]);
  await subAction.run(undefined, undefined);
};

const Vault: IAction = {
  id: 'vault',
  ignoreNetwork: true,
  run,
};

export { Vault };
