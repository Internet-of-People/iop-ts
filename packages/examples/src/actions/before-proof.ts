import { MorpheusTransaction } from '@internet-of-people/did-manager';
import inquirer from 'inquirer';
import { sendMorpheusTx } from '../transaction-sender';
import { IAction } from '../action';
import { chooseAction } from '../utils';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

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
  const subActions: IAction[] = [
    {
      id: 'register',
      run: register,
    },
    {
      id: 'revoke',
      run: revoke,
    },
  ];
  const subAction = await chooseAction(subActions, process.argv[3]);
  await subAction.run();
};

const BeforeProof: IAction = {
  id: 'before-proof',
  run,
};

export { BeforeProof };
