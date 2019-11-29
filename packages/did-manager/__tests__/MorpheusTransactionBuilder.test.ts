import { Managers, Transactions } from "@arkecosystem/crypto";
import 'jest-extended';
import { MorpheusTransaction, MorpheusTransactionBuilder, OperationAttemptsBuilder } from '../src/morpheus-transaction';

describe('MorpheusTransactionBuilder', () => {
  it('should verify correctly', () => {
    Managers.configManager.setFromPreset('testnet');
    Transactions.TransactionRegistry.registerTransactionType(MorpheusTransaction);

    const builder = new MorpheusTransactionBuilder();
    const ops = new OperationAttemptsBuilder()
      .registerBeforeProof("my content id")
      .revokeBeforeProof("old content id");
    const actual = builder
      .fromOperationAttempts(ops)
      .nonce('42')
      .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire');

    expect(actual.build().verified).toBeTrue();
    expect(actual.verify()).toBeTrue();
  });
});
