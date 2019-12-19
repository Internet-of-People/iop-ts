import { IAction } from '../action';
import { loadVault } from '../vault';
import { dumpDids, askDid, askSignerKeyId } from '../utils';
import { MorpheusTransaction } from '@internet-of-people/did-manager';
import { sendMorpheusTx } from '../transaction-sender';

const {
  Operations: { OperationAttemptsBuilder },
} = MorpheusTransaction;

const run = async(): Promise<void> => {
  const vault = loadVault();
  const vaultIds = vault.ids();

  dumpDids(vaultIds);
  const did = await askDid('tombstone');
  const signerKeyId = await askSignerKeyId(vaultIds);

  const opAttempts = new OperationAttemptsBuilder()
    .withVault(vault)
    .tombstoneDid(did)
    .sign(signerKeyId)
    .getAttempts();

  const id = await sendMorpheusTx(opAttempts);
  console.log(`Add right tx sent, id: ${id}`);
};

const Tombstone: IAction = {
  id: 'tombstone',
  run,
};

export { Tombstone };
