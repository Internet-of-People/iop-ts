import 'jest-extended';
import { Managers, Transactions } from '@arkecosystem/crypto';
import { KeyId, Vault, PersistentVault, Interfaces as KvInterfaces, SignedMessage } from '@internet-of-people/keyvault';
import { IOperationData } from '../src/interfaces';
import { Builder, Operations, Transaction } from '../src/morpheus-transaction';

beforeAll(() => {
  Managers.configManager.setFromPreset('testnet');
  Transactions.TransactionRegistry.registerTransactionType(Transaction.MorpheusTransaction);
});

afterAll(() => {
  Transactions.TransactionRegistry.deregisterTransactionType(Transaction.MorpheusTransaction);
});

const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
const newKeyId = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');
const rustVault = new Vault(PersistentVault.DEMO_PHRASE);
rustVault.createId();
const vault: KvInterfaces.IVault = {
  sign: (message: Uint8Array, did: KeyId): SignedMessage => {
    return rustVault.sign(did, message);
  }
}

const verifyTransaction = (ops: IOperationData[]): void => {
  const builder = new Builder.MorpheusTransactionBuilder();
  const actual = builder
    .fromOperationAttempts(ops)
    .nonce('42')
    .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire');

  console.log(JSON.stringify(actual.getStruct(), undefined, 2));

  expect(actual.build().verified).toBeTrue();
  expect(actual.verify()).toBeTrue();
}

describe('MorpheusTransactionBuilder', () => {

  it('registerBeforeProof verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .registerBeforeProof('my content id')
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeBeforeProof verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .revokeBeforeProof('old content id')
      .getAttempts();
    verifyTransaction(ops);
  });

  it('addKey verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .addKey(did, newKeyId)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

});
