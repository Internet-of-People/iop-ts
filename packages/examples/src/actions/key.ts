import inquirer from 'inquirer';
import { KeyId } from '@internet-of-people/keyvault';
import { MorpheusTransaction, Interfaces as DidInterfaces } from '@internet-of-people/did-manager';
import { IAction } from '../action';
import { sendMorpheusTx } from '../transaction-sender';
import { chooseAction } from '../utils';
import { loadVault } from '../vault';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const pattern = new RegExp(`^${DidInterfaces.MULTICIPHER_KEYID_PREFIX}`);

const authToDid = (id: KeyId): DidInterfaces.Did => {
  return id.toString().replace(pattern, DidInterfaces.MORPHEUS_DID_PREFIX);
};

const dumpDids = (vaultIds: KeyId[]): void => {
  console.log('These are the dids based on your private keys:');

  for (const id of vaultIds) {
    console.log(authToDid(id));
  }
};

const dumpKeyIds = (vaultIds: KeyId[]): void => {
  console.log('These are the key ids based on your private keys:');

  for (const id of vaultIds) {
    console.log(id.toString());
  }
};

const askDid = async(operation: string): Promise<DidInterfaces.Did> => {
  const { did }: { did: string; } = await inquirer.prompt([{
    type: 'input',
    name: 'did',
    message: `Type did to ${operation}:`,
  }]);
  return did;
};

const askAuth = async(operation: string): Promise<DidInterfaces.Authentication> => {
  const { auth }: { auth: DidInterfaces.Authentication; } = await inquirer.prompt([{
    type: 'input',
    name: 'auth',
    message: `Type a public key or key ID to ${operation} that DID`,
    filter: async(value: string): Promise<DidInterfaces.Authentication> => {
      return DidInterfaces.authenticationFromData(value);
    },
  }]);
  return auth;
};

const askExpires = async(): Promise<number | undefined> => {
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

const askSignerKeyId = async(ids: KeyId[]): Promise<KeyId> => {
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

const addKey = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('add key to');

  dumpKeyIds(vaultIds);
  const newAuth = await askAuth('add to');
  const expires = await askExpires();
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .addKey(did, newAuth, expires)
    .sign(signerKeyId)
    .getAttempts();

  const id = await sendMorpheusTx(opAttempts);
  console.log(`Add key tx sent, id: ${id}`);
};

const revokeKey = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('revoke key from');

  dumpKeyIds(vaultIds);
  const newAuth = await askAuth('revoke from');
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .revokeKey(did, newAuth)
    .sign(signerKeyId)
    .getAttempts();

  const id = await sendMorpheusTx(opAttempts);
  console.log(`Revoke key tx sent, id: ${id}`);
};

const run = async(): Promise<void> => {
  const subActions: IAction[] = [
    {
      id: 'add',
      run: addKey,
    },
    {
      id: 'revoke',
      run: revokeKey,
    },
  ];
  const subAction = await chooseAction(subActions, process.argv[3]);
  await subAction.run();
};

const Key: IAction = {
  id: 'key',
  run,
};

export { Key };
