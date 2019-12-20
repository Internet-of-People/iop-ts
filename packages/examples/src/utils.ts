import inquirer from 'inquirer';
import { KeyId } from '@internet-of-people/keyvault';
import { Interfaces as DidInterfaces } from '@internet-of-people/did-manager';
import { IAction } from './action';

const pattern = new RegExp(`^${DidInterfaces.MULTICIPHER_KEYID_PREFIX}`);

export const authToDid = (id: KeyId): DidInterfaces.Did => {
  return id.toString().replace(pattern, DidInterfaces.MORPHEUS_DID_PREFIX);
};

export const dumpDids = (vaultIds: KeyId[]): void => {
  console.log('These are the dids based on your private keys:');

  for (const id of vaultIds) {
    console.log(authToDid(id));
  }
};

export const dumpKeyIds = (vaultIds: KeyId[]): void => {
  console.log('These are the key ids based on your private keys:');

  for (const id of vaultIds) {
    console.log(id.toString());
  }
};

export const askDid = async(operation: string): Promise<DidInterfaces.Did> => {
  const { did }: { did: string; } = await inquirer.prompt([{
    type: 'input',
    name: 'did',
    message: `Type did to ${operation}:`,
  }]);
  return did;
};

export const askAuth = async(operation: string): Promise<DidInterfaces.Authentication> => {
  const { auth }: { auth: DidInterfaces.Authentication; } = await inquirer.prompt([{
    type: 'input',
    name: 'auth',
    message: `Type a public key or key ID to ${operation}:`,
    filter: async(value: string): Promise<DidInterfaces.Authentication> => {
      return DidInterfaces.authenticationFromData(value);
    },
  }]);
  return auth;
};

export const askExpires = async(): Promise<number | undefined> => {
  const { expires }: { expires?: number; } = await inquirer.prompt([{
    type: 'number',
    name: 'expires',
    default: 0,
    /* eslint @typescript-eslint/require-await: 0 */
    /* eslint no-undefined: 0 */
    filter: async(value: number): Promise<number | undefined> => {
      return value === 0 ? undefined : value;
    },
  }]);
  return expires;
};

export const askSignerKeyId = async(ids: KeyId[]): Promise<KeyId> => {
  const { signerKeyId }: { signerKeyId: KeyId; } = await inquirer.prompt([{
    name: 'signerKeyId',
    message: 'Choose id to sign with:',
    type: 'list',
    choices: ids.map((id) => {
      return { name: id.toString(), value: id };
    }),
  }]);
  return signerKeyId;
};

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
    choices: [ 'local(testnet)', 'testnet', 'devnet', 'mainnet' ],
  }]);
  return networkResult.network;
};

export const askForPassphrase = async(sender: string): Promise<string> => {
  const result = await inquirer.prompt([{
    name: 'passphrase',
    message: `Type passphrase for ${sender}:`,
    type: 'password',
  }]);

  if (!result.passphrase) {
    throw new Error('Passphrase must not be empty.');
  }
  return result.passphrase;
};

export const askForAddress = async(recipient: string): Promise<string> => {
  const result: { address?: string; } = await inquirer.prompt([{
    name: 'address',
    message: `Type the address of ${recipient}:`,
  }]);

  if (!result.address) {
    throw new Error('address must not be empty.');
  }
  return result.address;
};
