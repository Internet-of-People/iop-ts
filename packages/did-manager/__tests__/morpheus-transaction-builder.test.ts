import 'jest-extended';
import { Managers, Transactions } from '@arkecosystem/crypto';

import { KeyId, Vault, PersistentVault, IVault, SignedBytes } from '@internet-of-people/morpheus-core';
import { IO } from '@internet-of-people/sdk';
type TransactionId = IO.TransactionId;

import { IOperationData } from '../src/interfaces';
import { Builder, Operations, Transaction } from '../src/morpheus-transaction';
const { DidDocument: { RightRegistry } } = Operations;

beforeAll(() => {
  Managers.configManager.setFromPreset('testnet');
  Managers.configManager.setHeight(2);
  Transactions.TransactionRegistry.registerTransactionType(Transaction.MorpheusTransaction);
});

afterAll(() => {
  Transactions.TransactionRegistry.deregisterTransactionType(Transaction.MorpheusTransaction);
});

const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
const newKeyId = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
const rustVault = new Vault(PersistentVault.DEMO_PHRASE);
rustVault.createDid();

const vault: IVault = {
  signDidOperations: (keyId: KeyId, message: Uint8Array): SignedBytes => {
    return rustVault.signDidOperations(keyId, message);
  },
};

const lastTxId: TransactionId | null = null;

const verifyTransaction = (ops: IOperationData[]): void => {
  const builder = new Builder.MorpheusTransactionBuilder();
  const actual = builder
    .fromOperationAttempts(ops)
    .nonce('42')
    .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire');

  expect(actual.build().verified).toBeTrue();
  expect(actual.verify()).toBeTrue();
};

describe('MorpheusTransactionBuilder', () => {
  it('registerBeforeProof verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .registerBeforeProof('my content id')
      .getAttempts();
    verifyTransaction(ops);
  });

  it('addKey verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, lastTxId)
      .addKey(newKeyId)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeKey verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, lastTxId)
      .revokeKey(newKeyId)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('addRight verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, lastTxId)
      .addRight(newKeyId, RightRegistry.systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeright verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, lastTxId)
      .revokeRight(newKeyId, RightRegistry.systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('tombstoneDid verifies correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, lastTxId)
      .tombstoneDid()
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('multiple operations verify correctly', () => {
    const ops = new Operations.OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, lastTxId)
      .addKey(newKeyId)
      .addRight(newKeyId, RightRegistry.systemRights.update)
      .revokeRight(newKeyId, RightRegistry.systemRights.update)
      .revokeKey(newKeyId)
      .tombstoneDid()
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });
});
