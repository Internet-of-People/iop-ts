import { MorpheusTransaction } from '../src/morpheus-transaction';

describe('MorpheusTransaction', () => {
  it('can be serialized/deserialized', () => {
    const tx = new MorpheusTransaction();
    tx.data.asset.morpheusData = { operationAttempts: [
      { operation: "registerBeforeProof", params: { contentId: 'PROOF' } }
    ] };

    const serializedBuffer = tx.serialize();
    tx.data.asset = {};
    tx.deserialize(serializedBuffer.flip());

    expect(tx.data.asset).toBeDefined();
    expect(tx.data.asset.morpheusData).toBeDefined();
  });
});
