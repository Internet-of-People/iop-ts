import { KeyId } from '@internet-of-people/keyvault';
import { didToAuth, IDidDocumentState, IKeyData, Right } from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
import { assertStringlyEqual } from './utils';

const { DidDocument } = Operations;

const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
const keyId1 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
const keyId2 = new KeyId('iezkXs7Xd8SDWLaGKUAjEf53W');

export const assertEqualAuthEntries = (actual: IKeyData[], expected: IKeyData[]): void => {
  expect(actual).toHaveLength(expected.length);

  for (let i = 0; i < actual.length; i += 1) {
    assertStringlyEqual(actual[i].auth, expected[i].auth);
    expect(actual[i].valid).toBe(expected[i].valid);
    expect(actual[i].validUntilHeight).toBe(expected[i].validUntilHeight);
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
      { auth: defaultKeyId.toString(), revoked: false, valid: true },
    ]);
  });

  describe('Key Management', () => {
    it('keys cannot be added before height 2, as 1 is the genesis', () => {
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
        revoked: false,
        valid: true,
      }]);

      didState.apply.addKey(2, keyId1);
      const stateAtHeight2 = didState.query.getAt(2);
      expect(stateAtHeight2.height).toBe(2);
      expect(stateAtHeight2.did).toBe(did);
      assertEqualAuthEntries(stateAtHeight2.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
        { auth: keyId1.toString(), revoked: false, valid: true },
      ]);

      didState.apply.addKey(5, keyId2, 10);
      const stateAtHeight5 = didState.query.getAt(5);
      expect(stateAtHeight5.height).toBe(5);
      expect(stateAtHeight5.did).toBe(did);
      assertEqualAuthEntries(stateAtHeight5.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
        { auth: keyId1.toString(), revoked: false, valid: true },
        { auth: keyId2.toString(), revoked: false, valid: true, validUntilHeight: 10 },
      ]);

      const stateAtHeight10 = didState.query.getAt(10);
      expect(stateAtHeight10.height).toBe(10);
      expect(stateAtHeight10.did).toBe(did);
      assertEqualAuthEntries(stateAtHeight10.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
        { auth: keyId1.toString(), revoked: false, valid: true },
        { auth: keyId2.toString(), revoked: false, valid: false, validUntilHeight: 10 },
      ]);
    });

    it('can revoke keys', () => {
      didState.apply.addKey(2, keyId1);
      didState.apply.addRight(2, keyId1, Right.Update);
      didState.apply.revokeKey(5, keyId1);

      const stateAtHeight5 = didState.query.getAt(5);
      assertEqualAuthEntries(stateAtHeight5.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
        { auth: keyId1.toString(), revoked: false, valid: false },
      ]);
    });

    it('revoked keys has no rights', () => {
      didState.apply.addKey(2, keyId1);
      didState.apply.addRight(3, keyId1, Right.Update);
      didState.apply.revokeKey(5, keyId1);

      const stateAtHeight4 = didState.query.getAt(4);
      expect(stateAtHeight4.hasRight(keyId1, Right.Update)).toBeTruthy();

      const stateAtHeight5 = didState.query.getAt(5);
      expect(stateAtHeight5.hasRight(keyId1, Right.Update)).toBeFalsy();
    });

    it('adding keys can be reverted', () => {
      didState.apply.addKey(2, keyId1);
      const stateAtHeight2 = didState.query.getAt(2);
      assertEqualAuthEntries(stateAtHeight2.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
        { auth: keyId1.toString(), revoked: false, valid: true },
      ]);

      didState.revert.addKey(2, keyId1);
      const stateAtHeight5 = didState.query.getAt(2);
      assertEqualAuthEntries(stateAtHeight5.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
      ]);
    });

    it('adding keys cannot be reverted at different height as it were added', () => {
      didState.apply.addKey(2, keyId1);
      expect(() => {
        didState.revert.addKey(3, keyId1);
      }).toThrowError(
        `Cannot revert addKey in DID ${did}, because it was not added at the specified height.`,
      );
    });

    it('adding keys cannot be reverted with different expiration', () => {
      didState.apply.addKey(2, keyId1);
      expect(() => {
        didState.revert.addKey(2, keyId1, 5);
      }).toThrowError(
        `Cannot revert addKey in DID ${did}, because it was not added with the same expiration.`,
      );
    });

    it('adding keys cannot be reverted with different key', () => {
      didState.apply.addKey(2, keyId1);
      expect(() => {
        didState.revert.addKey(2, keyId2);
      }).toThrowError(
        `Cannot revert addKey in DID ${did}, because the key does not match the last added one.`,
      );
    });

    it('revoking keys can be reverted', () => {
      didState.apply.addKey(2, keyId1);
      didState.apply.revokeKey(5, keyId1);
      didState.revert.revokeKey(5, keyId1);

      const stateAtHeight5 = didState.query.getAt(5);
      assertEqualAuthEntries(stateAtHeight5.toData().keys, [
        { auth: defaultKeyId.toString(), revoked: false, valid: true },
        { auth: keyId1.toString(), revoked: false, valid: true },
      ]);
    });
  });

  describe('Right Management', () => {
    it('can add rights', () => {
      didState.apply.addKey(2, keyId1);
      didState.apply.addRight(5, keyId1, Right.Update);
      expect(didState.query.getAt(2).hasRight(keyId1, Right.Update)).toBeFalsy();
      expect(didState.query.getAt(5).hasRight(keyId1, Right.Update)).toBeTruthy();
    });

    it('cannot add right to a key that has not been added', () => {
      didState.apply.addKey(5, keyId1);
      expect(() => {
        didState.apply.addRight(2, keyId1, Right.Update);
      }).toThrowError(`DID ${did} has no valid key matching ${keyId1} at height 2`);
    });

    it('can revoke rights', () => {
      didState.apply.addKey(2, keyId1);

      didState.apply.addRight(3, keyId1, Right.Update);
      expect(didState.query.getAt(3).hasRight(keyId1, Right.Update)).toBeTruthy();

      didState.apply.revokeRight(5, keyId1, Right.Update);
      expect(didState.query.getAt(4).hasRight(keyId1, Right.Update)).toBeTruthy();
      expect(didState.query.getAt(5).hasRight(keyId1, Right.Update)).toBeFalsy();
    });

    it('cannot revoke right to a key that has not been added', () => {
      didState.apply.addKey(5, keyId1);
      expect(() => {
        didState.apply.revokeRight(2, keyId1, Right.Update);
      }).toThrowError(`DID ${did} has no valid key matching ${keyId1} at height 2`);
    });

    it('cannot revoke not applied right', () => {
      didState.apply.addKey(2, keyId1);

      expect(() => {
        didState.apply.revokeRight(5, keyId1, Right.Update);
      }).toThrowError(
        `right ${Right.Update} cannot be revoked from ${keyId1} as it was not present at height 5`,
      );
    });

    it('cannot revoke applied right before it was applied', () => {
      didState.apply.addKey(2, keyId1);
      didState.apply.addRight(5, keyId1, Right.Update);

      expect(() => {
        didState.apply.revokeRight(3, keyId1, Right.Update);
      }).toThrowError(
        `right ${Right.Update} cannot be revoked from ${keyId1} as it was not present at height 3`,
      ); // by default it's false
    });

    it('adding rights can be reverted', () => {
      didState.apply.addKey(2, keyId1);

      didState.apply.addRight(5, keyId1, Right.Update);
      expect(didState.query.getAt(5).hasRight(keyId1, Right.Update)).toBeTruthy();

      didState.revert.addRight(5, keyId1, Right.Update);
      expect(didState.query.getAt(5).hasRight(keyId1, Right.Update)).toBeFalsy();
    });

    it('revoking rights can be reverted', () => {
      didState.apply.addKey(2, keyId1);

      didState.apply.addRight(5, keyId1, Right.Update);
      didState.apply.revokeRight(6, keyId1, Right.Update);
      expect(didState.query.getAt(6).hasRight(keyId1, Right.Update)).toBeFalsy();

      didState.revert.revokeRight(6, keyId1, Right.Update);
      expect(didState.query.getAt(6).hasRight(keyId1, Right.Update)).toBeTruthy();
    });
  });

  describe('Tombstoning', () => {
    it('did can be tombstoned', () => {
      didState.apply.tombstone(5);
      const doc4 = didState.query.getAt(4);
      const doc5 = didState.query.getAt(5);
      expect(doc4.toData().tombstoned).toBeFalsy();
      expect(doc5.toData().tombstoned).toBeTruthy();
    });

    it('keys in a tombstoned did have no rights', () => {
      didState.apply.addKey(4, keyId1);
      didState.apply.addRight(4, keyId1, Right.Update);

      didState.apply.tombstone(5);
      const doc4 = didState.query.getAt(4);
      expect(doc4.toData().tombstoned).toBeFalsy();
      expect(doc4.hasRight(keyId1, Right.Update)).toBeTruthy();
      expect(doc4.hasRight(defaultKeyId, Right.Update)).toBeTruthy();
      expect(doc4.hasRight(defaultKeyId, Right.Impersonate)).toBeTruthy();
      expect(doc4.toData().rights[Right.Update]).toStrictEqual([ 0, 1 ]);
      expect(doc4.toData().rights[Right.Impersonate]).toStrictEqual([0]);

      const doc5 = didState.query.getAt(5);
      expect(doc5.toData().tombstoned).toBeTruthy();
      expect(doc5.hasRight(keyId1, Right.Update)).toBeFalsy();
      expect(doc5.hasRight(defaultKeyId, Right.Update)).toBeFalsy();
      expect(doc5.hasRight(defaultKeyId, Right.Impersonate)).toBeFalsy();
      expect(doc5.toData().rights[Right.Update]).toHaveLength(0);
      expect(doc5.toData().rights[Right.Impersonate]).toHaveLength(0);
    });

    it('tombstoned did cannot be updated', () => {
      const error = 'did is tombstoned at height 6, cannot be updated anymore';
      didState.apply.tombstone(5);
      expect(() => {
        didState.apply.addKey(6, keyId1);
      }).toThrowError(error);
      expect(() => {
        didState.apply.revokeKey(6, keyId1);
      }).toThrowError(error);
      expect(() => {
        didState.apply.addRight(6, keyId1, Right.Update);
      }).toThrowError(error);
      expect(() => {
        didState.apply.revokeRight(6, keyId1, Right.Update);
      }).toThrowError(error);
      expect(() => {
        didState.apply.tombstone(6);
      }).toThrowError(error);

      expect(() => {
        didState.revert.addKey(6, keyId1);
      }).toThrowError(error);
      expect(() => {
        didState.revert.revokeKey(6, keyId1);
      }).toThrowError(error);
      expect(() => {
        didState.revert.addRight(6, keyId1, Right.Update);
      }).toThrowError(error);
      expect(() => {
        didState.revert.revokeRight(6, keyId1, Right.Update);
      }).toThrowError(error);
    });

    it('tombstoned did can be reverted', () => {
      didState.apply.tombstone(5);
      expect(didState.query.getAt(5).isTombstoned()).toBeTruthy();

      didState.revert.tombstone(5);
      expect(didState.query.getAt(5).isTombstoned()).toBeFalsy();
    });
  });
});
