import { MorpheusTransaction } from '../src/morpheus-transaction';

describe('MorpheusTransaction', () => {
  it('can be serialized/deserialized', () => {
    const data = { operationAttempts: [
        { operation: "registerBeforeProof", params: { contentId: 'PROOF' } },
        { operation: "revokeBeforeProof", params: { contentId: 'OLD_PROOF' } },
      ] };

    const tx = new MorpheusTransaction();
    tx.data.asset.morpheusData = Object.assign({}, data, true);

    const serializedBuffer = tx.serialize();
    tx.data.asset = {};
    tx.deserialize(serializedBuffer.flip());

    expect(tx.data.asset).toBeDefined();
    expect(tx.data.asset.morpheusData).toBeDefined();
    expect(tx.data.asset.morpheusData).toStrictEqual(data);
  });
});
