import { KeyId } from '@internet-of-people/keyvault';
import { didToAuth, IDidDocumentState, IKeyData } from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
const { DidDocument } = Operations;

const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');
const keyId2 = new KeyId('IezkXs7Xd8SDWLaGKUAjEf53W');

export interface IToString {
  toString(): string;
}

export const assertStringlyEqual = (actual: IToString, expected: IToString): void => {
  expect(actual.toString()).toStrictEqual(expected.toString());
};

export const assertEqualAuthEntries = (actual: IKeyData[], expected: IKeyData[]): void => {
  expect(actual).toHaveLength(expected.length);

  for (let i = 0; i < actual.length; i += 1) {
    assertStringlyEqual(actual[i].auth, expected[i].auth);
    expect(actual[i].expired).toBe(expected[i].expired);
    expect(actual[i].expiresAtHeight).toBe(expected[i].expiresAtHeight);
  }
};

describe('Relation of DID and KeyId', () => {
  it('did can be converted to auth string', () => {
    assertStringlyEqual(didToAuth(did), defaultKeyId);
  });
});

describe('DidDocumentState', () => {
  let didState: IDidDocumentState;

  beforeEach(() => {
    didState = new DidDocument.DidDocumentState(did);
  });

  it('can query implicit document', () => {
    const didDoc = didState.query.getAt(1);
    expect(didDoc.height).toBe(1);
    expect(didDoc.did).toBe(did);

    const didData = didDoc.toData();
    assertEqualAuthEntries(didData.keys, [
      { auth: defaultKeyId.toString(), expired: false },
    ]);
  });

  it('keys cannot be added before height 2, as 1 the genesis', () => {
    expect(() => {
      didState.apply.addKey(1, keyId2);
    }).toThrowError();
  });

  it('can add keys', () => {
    const stateAtHeight1 = didState.query.getAt(1);
    expect(stateAtHeight1.height).toBe(1);
    expect(stateAtHeight1.did).toBe(did);
    assertEqualAuthEntries(stateAtHeight1.toData().keys, [{
      auth: defaultKeyId.toString(),
      expired: false,
    }]);

    didState.apply.addKey(2, keyId1);
    const stateAtHeight2 = didState.query.getAt(2);
    expect(stateAtHeight2.height).toBe(2);
    expect(stateAtHeight2.did).toBe(did);
    assertEqualAuthEntries(stateAtHeight2.toData().keys, [
      { auth: defaultKeyId.toString(), expired: false },
      { auth: keyId1.toString(), expired: false },
    ]);

    didState.apply.addKey(5, keyId2, 10);
    const stateAtHeight5 = didState.query.getAt(5);
    expect(stateAtHeight5.height).toBe(5);
    expect(stateAtHeight5.did).toBe(did);
    assertEqualAuthEntries(stateAtHeight5.toData().keys, [
      { auth: defaultKeyId.toString(), expired: false },
      { auth: keyId1.toString(), expired: false },
      { auth: keyId2.toString(), expired: false, expiresAtHeight: 10 },
    ]);

    const stateAtHeight10 = didState.query.getAt(10);
    expect(stateAtHeight10.height).toBe(10);
    expect(stateAtHeight10.did).toBe(did);
    assertEqualAuthEntries(stateAtHeight10.toData().keys, [
      { auth: defaultKeyId.toString(), expired: false },
      { auth: keyId1.toString(), expired: false },
      { auth: keyId2.toString(), expired: true, expiresAtHeight: 10 },
    ]);
  });

  it.todo('can revoke keys');

  it.todo('adding keys can be reverted');

  it.todo('revoking keys can be reverted');
});
