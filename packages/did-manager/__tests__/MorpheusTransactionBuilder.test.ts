import { Managers, Transactions } from "@arkecosystem/crypto";
import 'jest-extended';
import { MorpheusTransaction, MorpheusTransactionBuilder, OperationAttemptsBuilder } from '../src/morpheus-transaction';

describe('MorpheusTransactionBuilder', () => {
  it('should verify correctly', () => {
    Managers.configManager.setFromPreset('testnet');
    Transactions.TransactionRegistry.registerTransactionType(MorpheusTransaction);

    const builder = new MorpheusTransactionBuilder();
    const actual = builder
      .fromOperationAttempts(new OperationAttemptsBuilder().beforeProof({contentId:"my content id"}))
      .nonce('42')
      .sign('clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire');

    expect(actual.build().verified).toBeTrue();
    expect(actual.verify()).toBeTrue();
  });
});
