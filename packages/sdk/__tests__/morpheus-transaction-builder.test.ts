import 'jest-extended';
import { Managers, Transactions } from '@arkecosystem/crypto';
import { signMorpheusOperations } from '@internet-of-people/morpheus-crypto';

import { Crypto, Layer1, Layer2, Types } from '../src';
import { installWindowCrypto } from './utils';
import { defaultDid, defaultKeyId, keyId2 } from './known-keys';

type TransactionId = Types.Sdk.TransactionId;

installWindowCrypto();

describe('MorpheusTransactionBuilder', () => {
  const systemRights = new Layer2.SystemRights();

  beforeAll(() => {
    Managers.configManager.setFromPreset('testnet');
    Managers.configManager.setHeight(2);
    Transactions.TransactionRegistry.registerTransactionType(Layer1.MorpheusTransaction);
  });

  afterAll(() => {
    Transactions.TransactionRegistry.deregisterTransactionType(Layer1.MorpheusTransaction);
  });

  let signer: Crypto.MorpheusPrivate;
  let lastTxId: TransactionId | null;

  beforeEach(async() => {
    const unlockPassword = 'correct horse battery staple';
    const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPassword);
    Crypto.MorpheusPlugin.init(vault, unlockPassword);
    const m = Crypto.MorpheusPlugin.get(vault);
    signer = m.priv(unlockPassword);
    lastTxId = null;
  });

  const verifyTransaction = (ops: Types.Layer1.IOperationData[]): void => {
    const builder = new Layer1.MorpheusTransactionBuilder();
    const actual = builder
      .fromOperationAttempts(ops)
      .nonce('42')
      .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire');

    expect(actual.build().verified).toBeTrue();
    expect(actual.verify()).toBeTrue();
  };

  it('registerBeforeProof verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .registerBeforeProof('my content id')
      .getAttempts();
    verifyTransaction(ops);
  });

  it('addKey verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(defaultDid, lastTxId)
      .addKey(keyId2)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeKey verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(defaultDid, lastTxId)
      .revokeKey(keyId2)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);

    // Verify also that Wasm signature is the same
    const signedOps = ops[0] as Types.Layer1.ISignedOperationsData;
    const privateKey = signer.keyById(defaultKeyId).privateKey();
    const wasmSignedOps: Types.Layer1.ISignedOperationsData = signMorpheusOperations(signedOps.signables, privateKey);
    wasmSignedOps.operation = Layer1.OperationType.Signed;
    expect(wasmSignedOps).toStrictEqual(signedOps);
  });

  it('addRight verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(defaultDid, lastTxId)
      .addRight(keyId2, systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeright verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(defaultDid, lastTxId)
      .revokeRight(keyId2, systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('tombstoneDid verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(defaultDid, lastTxId)
      .tombstoneDid()
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('multiple operations verify correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(defaultDid, lastTxId)
      .addKey(keyId2)
      .addRight(keyId2, systemRights.update)
      .revokeRight(keyId2, systemRights.update)
      .revokeKey(keyId2)
      .tombstoneDid()
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });
});
