import { Managers, Transactions } from "@arkecosystem/crypto";
import 'jest-extended';
import { Builder, Transaction, Operations } from '../src/morpheus-transaction';

describe('MorpheusTransactionBuilder', () => {
  it('should verify correctly', () => {
    Managers.configManager.setFromPreset('testnet');
    Transactions.TransactionRegistry.registerTransactionType(Transaction.MorpheusTransaction);

    const builder = new Builder.MorpheusTransactionBuilder();
    const ops = new Operations.OperationAttemptsBuilder()
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
