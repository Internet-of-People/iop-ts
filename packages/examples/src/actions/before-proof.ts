import inquirer from 'inquirer';

import { Layer1, Types } from '@internet-of-people/sdk';

import { processMorpheusTx } from '../transaction-sender';
import { IAction } from '../action';
import { chooseAction, askHeight } from '../utils';

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

const registerBeforeProof = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const contentId = await askContentId();

  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .registerBeforeProof(contentId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Register before proof', layer1Api, layer2Api);
};

const queryBeforeProofHistory = async(_: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const contentId = await askContentId();

  const history = await layer2Api.getBeforeProofHistory(contentId);
  /* eslint no-undefined:0 */
  console.log(JSON.stringify(history, undefined, 2));
};

const queryBeforeProofExists = async(_: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const contentId = await askContentId();
  const height = await askHeight();

  const exists = await layer2Api.beforeProofExists(contentId, height);
  console.log(exists);
};

const run = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
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
  await subAction.run(layer1Api, layer2Api);
};

const BeforeProof: IAction = {
  id: 'before-proof',
  run,
};

export { BeforeProof };
