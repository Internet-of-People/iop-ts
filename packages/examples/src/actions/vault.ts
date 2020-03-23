import { IAction } from '../action';
import { chooseAction } from '../utils';
import { initDemoVault, loadVault } from '../vault';

const initVault = async(): Promise<void> => {
  const vault = initDemoVault();
  const id = vault.createDid();
  console.log('Vault created, 1st did is', id.toString());
};

const createDid = async(): Promise<void> => {
  const vault = loadVault();
  const id = vault.createDid();
  console.log('New did created', id.toString());
};

const listKeyIds = async(): Promise<void> => {
  const vault = loadVault();
  vault.keyIds().forEach((id, idx) => {
    console.log(`#${idx}: ${id.toString()}`);
  });
};

const listDids = async(): Promise<void> => {
  const vault = loadVault();
  vault.dids().forEach((did, idx) => {
    console.log(`#${idx}: ${did.toString()}`);
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
  await subAction.run();
};

const Vault: IAction = {
  id: 'vault',
  ignoreNetwork: true,
  run,
};

export { Vault };
