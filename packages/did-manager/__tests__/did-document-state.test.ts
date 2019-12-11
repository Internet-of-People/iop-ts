import { KeyId } from '@internet-of-people/keyvault';
import * as Interfaces from '../src/interfaces';
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

export const assertEqualAuthEntries = (actual: Interfaces.IKeyData[], expected: Interfaces.IKeyData[]): void => {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    assertStringlyEqual(actual[i].auth, expected[i].auth);
    expect(actual[i].expired).toBe(expected[i].expired);
    expect(actual[i].expiresAtHeight).toBe(expected[i].expiresAtHeight);
  }
};

describe('Relation of DID and KeyId', () => {
  it('did can be converted to auth string', () => {
    assertStringlyEqual(DidDocument.didToAuth(did), defaultKeyId);
  });
});

describe('DidDocumentState', () => {
  let didState: Interfaces.IDidDocumentState;

  beforeEach(() => {
    didState = new DidDocument.DidDocumentState(did);
  });

  it('can query implicit document', () => {
    const didDoc = didState.query.getAt(1);
    expect(didDoc.getHeight()).toBe(1);

    const didData = didDoc.toData();
    expect(didData.atHeight).toBe(1);
    assertEqualAuthEntries(didData.keys, [
      { auth: defaultKeyId, expired: false, }
    ]);
  });

  it('keys cannot be added before height 2, as 1 the genesis', () => {
    expect(() => {
      didState.apply.addKey(1, keyId2);
    }).toThrowError();
  });

  it('can add keys', () => {
    const stateAtHeight1 = didState.query.getAt(1);
    expect(stateAtHeight1.getHeight()).toBe(1);
    expect(stateAtHeight1.toData().atHeight).toBe(1);
    assertEqualAuthEntries(stateAtHeight1.toData().keys, [{
      auth: defaultKeyId,
      expired: false,
    }]);

    didState.apply.addKey(2, keyId1);
    const stateAtHeight2 = didState.query.getAt(2);
    expect(stateAtHeight2.getHeight()).toBe(2);
    expect(stateAtHeight2.toData().atHeight).toBe(2);
    assertEqualAuthEntries(stateAtHeight2.toData().keys, [
      { auth: defaultKeyId, expired: false },
      { auth: keyId1, expired: false },
    ]);

    didState.apply.addKey(5, keyId2, 10);
    const stateAtHeight5 = didState.query.getAt(5);
    expect(stateAtHeight5.getHeight()).toBe(5);
    expect(stateAtHeight5.toData().atHeight).toBe(5);
    assertEqualAuthEntries(stateAtHeight5.toData().keys, [
      { auth: defaultKeyId, expired: false },
      { auth: keyId1, expired: false },
      { auth: keyId2, expired: false, expiresAtHeight: 10 },
    ]);

    const stateAtHeight10 = didState.query.getAt(10);
    expect(stateAtHeight10.getHeight()).toBe(10);
    expect(stateAtHeight10.toData().atHeight).toBe(10);
    assertEqualAuthEntries(stateAtHeight10.toData().keys, [
      { auth: defaultKeyId, expired: false },
      { auth: keyId1, expired: false },
      { auth: keyId2, expired: true, expiresAtHeight: 10 },
    ]);
  });

  it.todo('can revoke keys');

  it.todo('adding keys can be reverted');

  it.todo('revoking keys can be reverted');
});
