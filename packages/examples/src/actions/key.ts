import { Crypto, Layer1, Types } from '@internet-of-people/sdk';

import { IAction } from '../action';
import { processMorpheusTx } from '../transaction-sender';
import { chooseAction, dumpDids, askDid, dumpKeyIds, askAuth, askHeight, askSignerKeyId } from '../utils';
import { loadVault, unlockPassword } from '../vault';

const addKey = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);

  dumpDids(m.pub.personas);
  const did = await askDid('add key to');

  dumpKeyIds(m.pub.personas);
  const newAuth = await askAuth('add to that DID');
  const expires = await askHeight();
  const signerKeyId = await askSignerKeyId(m.pub.personas);

  const lastTxId = await layer2Api.getLastTxId(did);
  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .signWith(m.priv(unlockPassword))
    .on(did, lastTxId)
    .addKey(newAuth, expires)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Add key', layer1Api, layer2Api);
};

const revokeKey = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const vault = await loadVault();
  const m = Crypto.MorpheusPlugin.get(vault);

  dumpDids(m.pub.personas);
  const did = await askDid('revoke key from');

  dumpKeyIds(m.pub.personas);
  const newAuth = await askAuth('revoke from that DID');
  const signerKeyId = await askSignerKeyId(m.pub.personas);

  const lastTxId = await layer2Api.getLastTxId(did);
  const opAttempts = new Layer1.OperationAttemptsBuilder()
    .signWith(m.priv(unlockPassword))
    .on(did, lastTxId)
    .revokeKey(newAuth)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Revoke key', layer1Api, layer2Api);
};

const run = async(layer1Api: Types.Layer1.IApi, layer2Api: Types.Layer2.IApi): Promise<void> => {
  const subActions: IAction[] = [
    {
      id: 'add',
      run: addKey,
    },
    {
      id: 'revoke',
      run: revokeKey,
    },
  ];
  const subAction = await chooseAction(subActions, process.argv[3]);
  await subAction.run(layer1Api, layer2Api);
};

const Key: IAction = {
  id: 'key',
  run,
};

export { Key };
