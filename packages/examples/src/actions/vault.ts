import { IAction } from '../action';
import { chooseAction } from '../utils';
import { initDemoVault, loadVault } from '../vault';

const initVault = async(): Promise<void> => {
  const vault = initDemoVault();
  const id = vault.createId();
  console.log('Vault created, 1st id is', id.toString());
};

const createId = async(): Promise<void> => {
  const vault = loadVault();
  const id = vault.createId();
  console.log('New id created', id.toString());
};

const listIds = async(): Promise<void> => {
  const vault = loadVault();
  vault.ids().forEach((id, idx) => {
    console.log(`#${idx}: ${id.toString()}`);
  });
};

const run = async(): Promise<void> => {
  const subActions: IAction[] = [
    {
      id: 'init',
      run: initVault,
    },
    {
      id: 'createId',
      run: createId,
    },
    {
      id: 'list',
      run: listIds,
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
