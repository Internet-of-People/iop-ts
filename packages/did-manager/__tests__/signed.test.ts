import { Layer1, Types } from '@internet-of-people/sdk';

describe('Signed', () => {
  it('serialization does not depend on the property order of the JSON', () => {
    const lastTxId = 'someTxId';
    const op1: Types.Layer1.ITombstoneDidData = {
      did: 'did1', lastTxId, operation: Layer1.SignableOperationType.TombstoneDid,
    };
    const op2: Types.Layer1.ITombstoneDidData = {
      operation: Layer1.SignableOperationType.TombstoneDid, lastTxId, did: 'did1',
    };
    const op3: Types.Layer1.ITombstoneDidData = {
      operation: Layer1.SignableOperationType.TombstoneDid, did: 'did0', lastTxId,
    };

    const ser1 = Layer1.Signed.serialize([ op1, op3 ]);
    const ser2 = Layer1.Signed.serialize([ op2, op3 ]);
    expect(ser1).toStrictEqual(ser2);
  });
});
