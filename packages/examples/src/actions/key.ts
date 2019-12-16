import inquirer from 'inquirer';
import { KeyId } from '@internet-of-people/keyvault';
import { MorpheusTransaction, Interfaces } from '@internet-of-people/did-manager';
import { IAction } from '../action';
import { sendMorpheusTx } from '../transaction-sender';
import { chooseAction } from '../utils';
import { loadVault } from '../vault';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const addKey = async(): Promise<void> => {
  const vault = loadVault();

  console.log('These are the dids based on your private keys:');

  for (const id of vault.ids()) {
    console.log(id.toString().replace(/^I/, 'did:morpheus:'));
  }

  const answers: {
    did: string;
    auth: Interfaces.Authentication;
    expires: number | undefined;
    signerKeyId: KeyId;
  } = await inquirer.prompt([
    {
      type: 'input',
      name: 'did',
      message: 'Type did to add key to:',
    },
    {
      type: 'input',
      name: 'auth',
      message: 'Type a public key or key ID to add to that DID',
      filter: async(value: string): Promise<Interfaces.Authentication> => {
        return Interfaces.authenticationFromData(value);
      },
    },
    {
      type: 'number',
      name: 'expires',
      /* eslint @typescript-eslint/require-await: 0 */
      /* eslint no-undefined: 0 */
      filter: async(value: number): Promise<number | undefined> => {
        return value === 0 ? undefined : value;
      },
    },
    {
      name: 'signerKeyId',
      message: 'Choose id to sign with:',
      type: 'list',
      choices: vault.ids().map((id) => {
        return id.toString();
      }),
      filter: async(value: string): Promise<KeyId> => {
        const found = vault.ids().find((id) => {
          return id.toString() === value;
        });

        if (!found) {
          throw new Error('Implementation error: just selected id was not found');
        }
        return found;
      },
    },
  ]);

  console.log(JSON.stringify(answers));

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
      .addKey(answers.did, answers.auth, answers.expires)
    .sign(answers.signerKeyId)
    .getAttempts();

  const id = await sendMorpheusTx(opAttempts);
  console.log(`Add key tx sent, id: ${id}`);
};

/* eslint @typescript-eslint/require-await: 0 */
const revokeKey = async(): Promise<void> => {
  throw new Error('not implemented yet');
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
