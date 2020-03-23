import { MorpheusTransaction } from '@internet-of-people/did-manager';

import { IAction } from '../action';
import { processMorpheusTx } from '../transaction-sender';
import { chooseAction, dumpDids, askDid, dumpKeyIds, askAuth, askHeight, askSignerKeyId } from '../utils';
import { loadVault } from '../vault';
import { Layer2Api } from '../layer2api';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const addKey = async(): Promise<void> => {
  const vault = loadVault();
  const keyIds = vault.keyIds();

  dumpDids(vault.dids());
  const did = await askDid('add key to');

  dumpKeyIds(keyIds);
  const newAuth = await askAuth('add to that DID');
  const expires = await askHeight();
  const signerKeyId = await askSignerKeyId(keyIds);

  const lastTxId = await Layer2Api.get().getLastTxId(did);
  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .on(did, lastTxId)
    .addKey(newAuth, expires)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Add key');
};

const revokeKey = async(): Promise<void> => {
  const vault = loadVault();
  const vaultKeyIds = vault.keyIds();

  dumpDids(vault.dids());
  const did = await askDid('revoke key from');

  dumpKeyIds(vaultKeyIds);
  const newAuth = await askAuth('revoke from that DID');
  const signerKeyId = await askSignerKeyId(vaultKeyIds);

  const lastTxId = await Layer2Api.get().getLastTxId(did);
  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .on(did, lastTxId)
    .revokeKey(newAuth)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Revoke key');
};

const run = async(): Promise<void> => {
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
  await subAction.run();
};

const Key: IAction = {
  id: 'key',
  run,
};

export { Key };
