import 'jest-extended';
import { Managers, Transactions } from '@arkecosystem/crypto';

import { Crypto, Layer1, Layer2, Types } from '../src';
type TransactionId = Types.Sdk.TransactionId;

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

  const did = new Crypto.Did('did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr');
  const defaultKeyId = new Crypto.KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
  const newKeyId = new Crypto.KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');

  let signer: Crypto.MorpheusPrivate;
  let lastTxId: TransactionId | null;

  beforeEach(async () => {
    const vault = await Crypto.XVault.create(Crypto.Seed.demoPhrase(), '');
    const m = await Crypto.morpheus(vault);
    signer = await m.priv();
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
      .on(did, lastTxId)
      .addKey(newKeyId)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeKey verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(did, lastTxId)
      .revokeKey(newKeyId)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('addRight verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(did, lastTxId)
      .addRight(newKeyId, systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('revokeright verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(did, lastTxId)
      .revokeRight(newKeyId, systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('tombstoneDid verifies correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(did, lastTxId)
      .tombstoneDid()
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });

  it('multiple operations verify correctly', () => {
    const ops = new Layer1.OperationAttemptsBuilder()
      .signWith(signer)
      .on(did, lastTxId)
      .addKey(newKeyId)
      .addRight(newKeyId, systemRights.update)
      .revokeRight(newKeyId, systemRights.update)
      .revokeKey(newKeyId)
      .tombstoneDid()
      .sign(defaultKeyId)
      .getAttempts();
    verifyTransaction(ops);
  });
});
