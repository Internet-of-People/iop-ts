import { Utils } from '@arkecosystem/crypto';

import { sendTransferTx } from '../transaction-sender';
import { askForPassphrase, askForAddress } from '../utils';
import { IAction } from '../action';
import inquirer = require('inquirer');

const askForAmount = async(): Promise<number> => {
  const { amount }: { amount: number; } = await inquirer.prompt([{
    type: 'number',
    name: 'amount',
    message: `Enter an amount in HYD:`,
  }]);
  return amount;
};

const run = async(): Promise<void> => {
  const sender = await askForPassphrase('sender');
  const recipient = await askForAddress('recipient');
  const amount = await askForAmount();
  await sendTransferTx(
    sender,
    recipient,
    Utils.BigNumber.make(amount).times(1e8),
  );
};

const Transfer: IAction = {
  id: 'transfer',
  run,
};

export { Transfer };
