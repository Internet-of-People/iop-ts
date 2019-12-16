import { MorpheusTransaction } from '@internet-of-people/did-manager';
import inquirer from 'inquirer';
import { sendMorpheusTx } from '../transaction-sender';
import { IAction } from '../action';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const askForAction = async(): Promise<string> => {
  const result = await inquirer.prompt([{
    name: 'action',
    message: 'Choose action:',
    type: 'list',
    choices: [ 'register', 'revoke' ],
  }]);
  return result.action;
};

const register = async(): Promise<void> => {
  const result = await inquirer.prompt([{
    name: 'contentId',
    message: 'Type your contentId below:',
  }]);

  if (!result.contentId) {
    throw new Error('ContentId must not be empty.');
  }

  const opAttempts = new OperationAttemptsBuilder()
    .registerBeforeProof(result.contentId)
    .getAttempts();
  const id = await sendMorpheusTx(opAttempts);
  console.log(`Register before proof tx send, id: ${id}`);
};

const revoke = async(): Promise<void> => {
  const result = await inquirer.prompt([{
    name: 'contentId',
    message: 'Type your contentId below:',
  }]);

  if (!result.contentId) {
    throw new Error('ContentId must not be empty.');
  }

  const opAttempts = new OperationAttemptsBuilder()
    .revokeBeforeProof(result.contentId)
    .getAttempts();
  const id = await sendMorpheusTx(opAttempts);
  console.log(`Revoke before proof tx send, id: ${id}`);
};

const run = async(): Promise<void> => {
  const action = await askForAction();

  if (action === 'register') {
    await register();
  } else if (action === 'revoke') {
    await revoke();
  } else {
    throw new Error(`Unknown action ${action}.`);
  }
};

const BeforeProof: IAction = {
  id: 'before-proof',
  run,
};

export { BeforeProof };
