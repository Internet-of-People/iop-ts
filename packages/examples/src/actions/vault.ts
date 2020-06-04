import { Crypto } from '@internet-of-people/sdk';

/* eslint no-undefined: 0 */
import { IAction } from '../action';
import { chooseAction } from '../utils';
import { initDemoVault, morpheus } from '../vault';

const initVault = async(): Promise<void> => {
  const vault = await initDemoVault();
  const m = await Crypto.morpheus(vault);
  const did = m.pub.personas.did(0);
  console.log('Vault created, 1st did is', did.toString());
};

const createDid = async(): Promise<void> => {
  const m = await morpheus();
  const priv = await m.priv();
  const did = await priv.personas.did(priv.personas.count);
  console.log('New did created', did.toString());
};

const listKeyIds = async(): Promise<void> => {
  const m = await morpheus();
  m.pub.personas.keyIds().forEach((id, idx) => {
    console.log(`#${idx}: ${id}`);
  });
};

const listDids = async(): Promise<void> => {
  const m = await morpheus();
  m.pub.personas.dids().forEach((did, idx) => {
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
