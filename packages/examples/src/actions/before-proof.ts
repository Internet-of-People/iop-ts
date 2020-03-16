import inquirer from 'inquirer';

import { MorpheusTransaction } from '@internet-of-people/did-manager';

import { processMorpheusTx } from '../transaction-sender';
import { IAction } from '../action';
import { chooseAction, askHeight } from '../utils';
import { Layer2Api } from '../layer2api';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const askContentId = async(): Promise<string> => {
  const result = await inquirer.prompt([{
    name: 'contentId',
    message: 'Type the contentId below:',
  }]);
  const { contentId } = result;

  if (!contentId) {
    throw new Error('ContentId must not be empty.');
  }
  return contentId;
};

const registerBeforeProof = async(): Promise<void> => {
  const contentId = await askContentId();

  const opAttempts = new OperationAttemptsBuilder()
    .registerBeforeProof(contentId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Register before proof');
};

const queryBeforeProofHistory = async(): Promise<void> => {
  const contentId = await askContentId();

  const history = await Layer2Api.get().getBeforeProofHistory(contentId);
  /* eslint no-undefined:0 */
  console.log(JSON.stringify(history, undefined, 2));
};

const queryBeforeProofExists = async(): Promise<void> => {
  const contentId = await askContentId();
  const height = await askHeight();

  const exists = await Layer2Api.get().beforeProofExists(contentId, height);
  console.log(exists);
};

const run = async(): Promise<void> => {
  const subActions: IAction[] = [
    {
      id: 'register',
      run: registerBeforeProof,
    },
    {
      id: 'query',
      run: queryBeforeProofHistory,
    },
    {
      id: 'exists',
      run: queryBeforeProofExists,
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
