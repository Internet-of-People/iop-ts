import { Signed } from '../src/morpheus-transaction/operations';
import { ITombstoneDidData, SignableOperationType } from '../src/interfaces';

describe('Signed', () => {
  it('serialization does not depend on the property order of the JSON', () => {
    const lastTxId = 'someTxId';
    const op1: ITombstoneDidData = { did: 'did1', lastTxId, operation: SignableOperationType.TombstoneDid };
    const op2: ITombstoneDidData = { operation: SignableOperationType.TombstoneDid, lastTxId, did: 'did1' };
    const op3: ITombstoneDidData = { operation: SignableOperationType.TombstoneDid, did: 'did0', lastTxId };

    const ser1 = Signed.serialize([ op1, op3 ]);
    const ser2 = Signed.serialize([ op2, op3 ]);
    expect(ser1).toStrictEqual(ser2);
  });
});
