import { Layer1 } from '../src';

describe('MorpheusTransaction', () => {
  const operationAttempts1 = [
    { operation: 'registerBeforeProof', contentId: 'PROOF1' },
    { operation: 'registerBeforeProof', contentId: 'PROOF2' },
  ];
  const operationAttempts2 = [
    'this', 'could be', 'anything', 'really', 5, 'not sure if that is good',
  ];

  for (const operationAttempts of [ operationAttempts1, operationAttempts2 ]) {
    it('can be serialized/deserialized', () => {
      const tx = new Layer1.MorpheusTransaction();
      tx.data.asset.operationAttempts = Object.assign([], operationAttempts);
      const serializedBuffer = tx.serialize();

      const rx = new Layer1.MorpheusTransaction();
      rx.deserialize(serializedBuffer.flip());

      expect(rx.data.asset).toBeDefined();
      expect(rx.data.asset.operationAttempts).toBeDefined();
      expect(rx.data.asset.operationAttempts).toStrictEqual(operationAttempts);
    });
  }
});
