import { Utils } from '@arkecosystem/crypto';

import { sendTransfer } from '../transaction-sender';
import { askForPassphrase, askForAddress } from '../utils';
import { IAction } from '../action';

const run = async(): Promise<void> => {
  await sendTransfer(
    await askForPassphrase(), // genesis
    await askForAddress(),
    Utils.BigNumber.make(1000 * 1e8),
  );
};

const Transfer: IAction = {
  id: 'transfer',
  run,
};

export { Transfer };
