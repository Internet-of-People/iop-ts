import { Utils } from '@arkecosystem/crypto';

import { sendTransferTx } from '../transaction-sender';
import { askForPassphrase, askForAddress } from '../utils';
import { IAction } from '../action';

const run = async(): Promise<void> => {
  const sender = await askForPassphrase('sender'); // genesis
  const recipient = await askForAddress('recipient');
  await sendTransferTx(
    sender,
    recipient,
    Utils.BigNumber.make(1000 * 1e8),
  );
};

const Transfer: IAction = {
  id: 'transfer',
  run,
};

export { Transfer };
