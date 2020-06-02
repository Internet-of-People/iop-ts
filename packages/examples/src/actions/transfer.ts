import inquirer from 'inquirer';

import { Types } from '@internet-of-people/sdk';

import { askForPassphrase, askForAddress } from '../utils';
import { IAction } from '../action';

const askForAmount = async(): Promise<number> => {
  const { amount }: { amount: number; } = await inquirer.prompt([{
    type: 'number',
    name: 'amount',
    message: `Enter an amount in HYD:`,
  }]);
  return amount;
};

const run = async(layer1Api: Types.Layer1.IApi, _: Types.Layer2.IApi): Promise<void> => {
  const sender = await askForPassphrase('sender');
  const recipient = await askForAddress('recipient');
  const amount = await askForAmount();
  await layer1Api.sendTransferTxWithPassphrase(
    sender,
    recipient,
    BigInt(amount) * BigInt(1e8),
  );
};

const Transfer: IAction = {
  id: 'transfer',
  run,
};

export { Transfer };
