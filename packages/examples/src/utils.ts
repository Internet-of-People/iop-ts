import inquirer from "inquirer";

export const askForNetwork = async (): Promise<'testnet'|'devnet'|'mainnet'> => {
  const networkResult = await inquirer.prompt([{
    name: 'network',
    message: 'Choose network:',
    type: 'list',
    choices: ['testnet', 'devnet', 'mainnet'],
  }]);
  return networkResult.network;
};

export const askForPassphrase = async (): Promise<string> => {
  const result = await inquirer.prompt([{
      name: 'passphrase',
      message: 'Type your passphrase below:',
      type: 'password',
    }]);
  if(!result.passphrase) {
    throw new Error('Passphrase must not be empty.');
  }
  return result.passphrase;
};

