import { Layer1 } from '@internet-of-people/sdk';

import { IAction } from '../action';
import { loadVault } from '../vault';
import { dumpDids, askDid, askSignerKeyId } from '../utils';
import { processMorpheusTx } from '../transaction-sender';
import { Layer2Api } from '../layer2api';

const run = async(): Promise<void> => {
  const vault = loadVault();
  const keyIds = vault.keyIds();

  dumpDids(vault.dids());
  const did = await askDid('tombstone');
  const signerKeyId = await askSignerKeyId(keyIds);

  const lastTxId = await Layer2Api.get().getLastTxId(did);
  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .withVault(vault)
    .on(did, lastTxId)
    .tombstoneDid()
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Tombstone did');
};

const Tombstone: IAction = {
  id: 'tombstone',
  run,
};

export { Tombstone };
