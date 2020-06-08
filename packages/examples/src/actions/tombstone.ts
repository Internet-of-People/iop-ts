import { Crypto, Layer1, Types } from '@internet-of-people/sdk';
import { IAction } from '../action';
import { loadVault } from '../vault';
import { dumpDids, askDid, askSignerKeyId } from '../utils';
import { processMorpheusTx } from '../transaction-sender';

const run = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const vault = await loadVault();
  const m = await Crypto.morpheus(vault);
  const keyIds = m.pub.personas.keyIds();

  dumpDids(m.pub.personas.dids());
  const did = await askDid('tombstone');
  const signerKeyId = await askSignerKeyId(keyIds);

  const lastTxId = await layer2Api.getLastTxId(did);
  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .signWith(await m.priv())
    .on(did, lastTxId)
    .tombstoneDid()
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Tombstone did', layer1Api, layer2Api);
};

const Tombstone: IAction = {
  id: 'tombstone',
  run,
};

export { Tombstone };
