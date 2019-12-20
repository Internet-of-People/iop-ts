import { MorpheusTransaction } from '@internet-of-people/did-manager';
import { IAction } from '../action';
import { processMorpheusTx } from '../transaction-sender';
import { chooseAction, dumpDids, askDid, dumpKeyIds, askAuth, askHeight, askSignerKeyId } from '../utils';
import { loadVault } from '../vault';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const addKey = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('add key to');

  dumpKeyIds(vaultIds);
  const newAuth = await askAuth('add to that DID');
  const expires = await askHeight();
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .addKey(did, newAuth, expires)
    .sign(signerKeyId)
    .getAttempts();

  await processMorpheusTx(opAttempts, 'Add key');
};

const revokeKey = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('revoke key from');

  dumpKeyIds(vaultIds);
  const newAuth = await askAuth('revoke from that DID');
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .revokeKey(did, newAuth)
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
