import { MorpheusTransaction } from '../src/morpheus-transaction';

describe('MorpheusTransaction', () => {
  it('can be serialized/deserialized', () => {
    const operationAttempts = [
        { operation: "registerBeforeProof", params: { contentId: 'PROOF' } },
        { operation: "revokeBeforeProof", params: { contentId: 'OLD_PROOF' } },
      ];

    const tx = new MorpheusTransaction();
    tx.data.asset.operationAttempts = Object.assign([], operationAttempts);
    const serializedBuffer = tx.serialize();

    const rx = new MorpheusTransaction();
    rx.deserialize(serializedBuffer.flip());

    expect(rx.data.asset).toBeDefined();
    expect(rx.data.asset.operationAttempts).toBeDefined();
    expect(rx.data.asset.operationAttempts).toStrictEqual(operationAttempts);
  });
});
