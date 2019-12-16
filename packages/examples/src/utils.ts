import inquirer from 'inquirer';
import { IAction } from './action';

export const chooseAction = async(actions: IAction[], id?: string): Promise<IAction> => {
  let actionId = id;

  if (!id) {
    const answers = await inquirer.prompt([{
      name: 'action',
      message: 'Choose action:',
      type: 'list',
      choices: actions.map((a) => {
        return a.id;
      }),
    }]);
    actionId = answers.action;
  }

  const action = actions.find((a) => {
    return a.id === actionId;
  });

  if (!action) {
    throw new Error(`Unknown action provided: ${actionId}`);
  }
  return action;
};


export const askForNetwork = async(): Promise<'testnet'|'devnet'|'mainnet'> => {
  const networkResult = await inquirer.prompt([{
    name: 'network',
    message: 'Choose network:',
    type: 'list',
    choices: [ 'testnet', 'devnet', 'mainnet' ],
  }]);
  return networkResult.network;
};

export const askForPassphrase = async(): Promise<string> => {
  const result = await inquirer.prompt([{
    name: 'passphrase',
    message: 'Type your passphrase below:',
    type: 'password',
  }]);

  if (!result.passphrase) {
    throw new Error('Passphrase must not be empty.');
  }
  return result.passphrase;
};

export const askForAddress = async(): Promise<string> => {
  const result = await inquirer.prompt([{
    name: 'address',
    message: 'Type your recipient\'s address below:',
  }]);

  if (!result.address) {
    throw new Error('address must not be empty.');
  }
  return result.address;
};
