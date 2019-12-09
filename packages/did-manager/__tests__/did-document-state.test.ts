import * as Interfaces from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
const { DidDocument } = Operations;

describe('Relation of DID and KeyId', () => {
  it('did can be converted to auth string', () => {
    expect(DidDocument.didToAuth('did:morpheus:ezFoo')).toBe('iezFoo');
  });
});

describe('DidDocumentState', () => {
  const did = 'did:morpheus:ezFoo'; // TODO
  let didState: Interfaces.IDidDocumentState;

  beforeEach(() => {
    didState = new DidDocument.DidDocumentState(did);
  });

  it('can query implicit document', () => {
    const didDoc = didState.query.getAt(1);
    expect(didDoc.getHeight()).toBe(1);

    const didData = didDoc.toData();
    expect(didData.atHeight).toBe(1);
    expect(didData.keys).toStrictEqual([{
      auth: 'iezFoo',
      expired: false,
    }]);
  });

  it('keys cannot be added before height 2, as 1 the genesis', () => {
    expect(() => {
      didState.apply.addKey(1, 'iezBar2');
    }).toThrowError();
  });

  it('can add keys', () => {
    const stateAtHeight1 = didState.query.getAt(1);
    expect(stateAtHeight1.getHeight()).toBe(1);
    expect(stateAtHeight1.toData().atHeight).toBe(1);
    expect(stateAtHeight1.toData().keys).toStrictEqual([{
      auth: 'iezFoo',
      expired: false,
    }]);

    didState.apply.addKey(2, 'iezBar1');
    const stateAtHeight2 = didState.query.getAt(2);
    expect(stateAtHeight2.getHeight()).toBe(2);
    expect(stateAtHeight2.toData().atHeight).toBe(2);
    expect(stateAtHeight2.toData().keys).toStrictEqual([
      { auth: 'iezFoo', expired: false },
      { auth: 'iezBar1', expired: false },
    ]);

    didState.apply.addKey(5, 'iezBar2', 10);
    const stateAtHeight5 = didState.query.getAt(5);
    expect(stateAtHeight5.getHeight()).toBe(5);
    expect(stateAtHeight5.toData().atHeight).toBe(5);
    expect(stateAtHeight5.toData().keys).toStrictEqual([
      { auth: 'iezFoo', expired: false },
      { auth: 'iezBar1', expired: false },
      { auth: 'iezBar2', expired: false, expiresAtHeight: 10 },
    ]);

    const stateAtHeight10 = didState.query.getAt(10);
    expect(stateAtHeight10.getHeight()).toBe(10);
    expect(stateAtHeight10.toData().atHeight).toBe(10);
    expect(stateAtHeight10.toData().keys).toStrictEqual([
      { auth: 'iezFoo', expired: false },
      { auth: 'iezBar1', expired: false },
      { auth: 'iezBar2', expired: true, expiresAtHeight: 10 },
    ]);
  });

  it.todo('can revoke keys');

  it.todo('adding keys can be reverted');

  it.todo('revoking keys can be reverted');
});
