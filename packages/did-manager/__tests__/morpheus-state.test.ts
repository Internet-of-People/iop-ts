import { Layer2 } from '@internet-of-people/sdk';

import { MorpheusState } from '../src/morpheus-transaction/state';
import { IMorpheusState } from '../src/interfaces';

import { assertStringlyEqual, defaultKeyId, did, keyId1, keyId2 } from './morpheus-state-handler.test';
import { Operations } from '../src/morpheus-transaction';

const { RightRegistry } = Operations;

const updateRight = RightRegistry.systemRights.update;
const impersonateRight = RightRegistry.systemRights.impersonate;

describe('Cloneable', () => {
  it('actually works', () => {
    const newContentId1 = 'newContentId1';
    const newContentId2 = 'newContentId2';
    const oldContentId = 'oldContentId';

    const oldState = new MorpheusState();
    oldState.apply.registerBeforeProof(oldContentId, 5);

    const newState = oldState.clone();
    expect(newState).not.toBe(oldState);

    newState.apply.registerBeforeProof(newContentId1, 5);

    expect(oldState.query.beforeProofExistsAt(oldContentId, 5)).toBeTruthy();
    expect(newState.query.beforeProofExistsAt(oldContentId, 5)).toBeTruthy();

    expect(oldState.query.beforeProofExistsAt(newContentId1, 5)).toBeFalsy();
    expect(newState.query.beforeProofExistsAt(newContentId1, 5)).toBeTruthy();

    expect(oldState.query.beforeProofExistsAt(newContentId2, 7)).toBeFalsy();
    oldState.apply.registerBeforeProof(newContentId2, 7);
    expect(oldState.query.beforeProofExistsAt(newContentId2, 7)).toBeTruthy();
    expect(newState.query.beforeProofExistsAt(newContentId2, 7)).toBeFalsy();
  });
});

describe('MorpheusState', () => {
  const contentId = 'myFavoriteContentId';
  let state: IMorpheusState;

  beforeEach(() => {
    state = new MorpheusState();
  });

  it('not registered content does not exist', () => {
    expect(state.query.beforeProofExistsAt(contentId, 7)).toBeFalsy();
  });

  it('registered content exists', () => {
    state.apply.registerBeforeProof(contentId, 5);

    expect(state.query.beforeProofExistsAt(contentId, 4)).toBeFalsy();
    expect(state.query.beforeProofExistsAt(contentId, 5)).toBeTruthy();
    expect(state.query.beforeProofExistsAt(contentId, 7)).toBeTruthy();
    /* eslint no-undefined:0 */
    expect(state.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();
  });

  it('rejects before proof with old block height', () => {
    state.apply.registerBeforeProof(contentId, 5);
    expect(() => {
      return state.apply.registerBeforeProof(contentId, 3);
    }).toThrowError('value was already set at that height');
  });

  it('rejects before proof with already registered content id', () => {
    state.apply.registerBeforeProof(contentId, 5);
    expect(() => {
      return state.apply.registerBeforeProof(contentId, 7);
    }).toThrowError(`Before proof ${contentId} is already registered at 7`);
  });

  it('apply add new key accepted for default key as signer', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);

    const keys5 = state.query.getDidDocumentAt(did, 5).toData().keys;
    expect(keys5).toHaveLength(2);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    expect(keys5[0].valid).toBeTruthy();
    assertStringlyEqual(keys5[1].auth, keyId1);
    expect(keys5[1].valid).toBeTruthy();

    const keys4 = state.query.getDidDocumentAt(did, 4).toData().keys;
    expect(keys4).toHaveLength(1);
    assertStringlyEqual(keys4[0].auth, defaultKeyId);
    expect(keys4[0].valid).toBeTruthy();
  });

  it('apply add key is rejected with unauthorized key', () => {
    expect(() => {
      return state.apply.addKey(5, keyId1, did, null, keyId1);
    })
      .toThrowError(`${keyId1} has no right to update ${did} at height 5`);
  });

  it('revert add key works with valid data', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.revert.addKey(5, defaultKeyId, did, null, keyId1);

    const keys5 = state.query.getDidDocumentAt(did, 5).toData().keys;
    expect(keys5).toHaveLength(1);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    expect(keys5[0].valid).toBeTruthy();
  });

  it('revert add key throws with invalid data', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    expect(() => {
      state.revert.addKey(5, defaultKeyId, did, null, defaultKeyId);
    }).toThrowError(`Cannot revert addKey in DID ${did}, because the key does not match the last added one`);
  });

  it('not registered rights cannot be applied', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    expect(() => {
      state.apply.addRight(7, defaultKeyId, did, null, keyId1, 'custom-right');
    }).toThrowError('Right custom-right is not registered');
  });

  it('apply add right accepted for different key', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(7, defaultKeyId, did, null, keyId1, updateRight);

    const data7 = state.query.getDidDocumentAt(did, 7).toData();
    const doc7 = new Layer2.DidDocument(data7);
    const keys7 = data7.keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(doc7.hasRightAt(defaultKeyId, impersonateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, impersonateRight, 7)).toBeFalsy();
    expect(doc7.hasRightAt(defaultKeyId, updateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, updateRight, 7)).toBeTruthy();

    const data5 = state.query.getDidDocumentAt(did, 5).toData();
    const doc5 = new Layer2.DidDocument(data5);
    const keys5 = data5.keys;
    expect(keys5).toHaveLength(2);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    expect(keys5[0].valid).toBeTruthy();
    assertStringlyEqual(keys5[1].auth, keyId1);
    expect(keys5[1].valid).toBeTruthy();
    expect(doc5.hasRightAt(defaultKeyId, impersonateRight, 5)).toBeTruthy();
    expect(doc5.hasRightAt(keyId1, impersonateRight, 5)).toBeFalsy();
    expect(doc5.hasRightAt(defaultKeyId, updateRight, 5)).toBeTruthy();
    expect(doc5.hasRightAt(keyId1, updateRight, 5)).toBeFalsy();
  });

  it('apply add right rejected for same key', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    expect(() => {
      state.apply.addRight(6, keyId1, did, null, keyId1, updateRight);
    }).toThrowError(`${keyId1} has no right to update ${did} at height 6`);
  });

  it('apply add right rejected because it existed', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    expect(() => {
      state.apply.addRight(7, defaultKeyId, did, null, keyId1, updateRight);
    }).toThrowError(
      `right update was already granted to ${keyId1} on DID ${did} at height 7`,
    );
  });

  it('revert add right accepted for different key', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(7, defaultKeyId, did, null, keyId1, updateRight);
    state.revert.addRight(7, defaultKeyId, did, null, keyId1, updateRight);

    const data7 = state.query.getDidDocumentAt(did, 7).toData();
    const doc7 = new Layer2.DidDocument(data7);
    const keys7 = data7.keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(doc7.hasRightAt(defaultKeyId, impersonateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, impersonateRight, 7)).toBeFalsy();
    expect(doc7.hasRightAt(defaultKeyId, updateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, updateRight, 7)).toBeFalsy();

    const data5 = state.query.getDidDocumentAt(did, 5).toData();
    const doc5 = new Layer2.DidDocument(data5);
    const keys5 = data5.keys;
    expect(keys5).toHaveLength(2);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    assertStringlyEqual(keys5[1].auth, keyId1);
    expect(doc5.hasRightAt(defaultKeyId, impersonateRight, 5)).toBeTruthy();
    expect(doc5.hasRightAt(keyId1, impersonateRight, 5)).toBeFalsy();
    expect(doc5.hasRightAt(defaultKeyId, updateRight, 5)).toBeTruthy();
    expect(doc5.hasRightAt(keyId1, updateRight, 5)).toBeFalsy();
  });

  it('apply revoke right accepted for different key', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, impersonateRight);

    state.apply.revokeRight(7, defaultKeyId, did, null, keyId1, impersonateRight);
    state.apply.revokeRight(7, keyId1, did, null, defaultKeyId, updateRight);

    const data7 = state.query.getDidDocumentAt(did, 7).toData();
    const doc7 = new Layer2.DidDocument(data7);
    const keys7 = data7.keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(doc7.hasRightAt(defaultKeyId, impersonateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, impersonateRight, 7)).toBeFalsy();
    expect(doc7.hasRightAt(defaultKeyId, updateRight, 7)).toBeFalsy();
    expect(doc7.hasRightAt(keyId1, updateRight, 7)).toBeTruthy();
  });

  it('apply revoke right rejected for same key', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    expect(() => {
      state.apply.revokeRight(7, keyId1, did, null, keyId1, updateRight);
    }).toThrowError(`${keyId1} cannot modify its own authorization (as ${keyId1})`);
  });

  it('apply revoke right rejected because it did not exist', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    expect(() => {
      state.apply.revokeRight(7, defaultKeyId, did, null, keyId1, updateRight);
    }).toThrowError(
      `right ${updateRight} cannot be revoked from ${keyId1} on DID ${did} as it was not present at height 7`,
    );
  });

  it('revert revoke right accepted for different key', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    state.apply.revokeRight(7, defaultKeyId, did, null, keyId1, updateRight);
    state.revert.revokeRight(7, defaultKeyId, did, null, keyId1, updateRight);

    const data7 = state.query.getDidDocumentAt(did, 7).toData();
    const doc7 = new Layer2.DidDocument(data7);
    const keys7 = data7.keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(doc7.hasRightAt(defaultKeyId, impersonateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, impersonateRight, 7)).toBeFalsy();
    expect(doc7.hasRightAt(defaultKeyId, updateRight, 7)).toBeTruthy();
    expect(doc7.hasRightAt(keyId1, updateRight, 7)).toBeTruthy();
  });

  it('apply revoke key works with appropriate rights', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    state.apply.revokeKey(7, keyId1, did, null, defaultKeyId);

    const keys6 = state.query.getDidDocumentAt(did, 6).toData().keys;
    expect(keys6).toHaveLength(2);
    assertStringlyEqual(keys6[0].auth, defaultKeyId);
    expect(keys6[0].valid).toBeTruthy();
    assertStringlyEqual(keys6[1].auth, keyId1);
    expect(keys6[1].valid).toBeTruthy();

    const keys7 = state.query.getDidDocumentAt(did, 7).toData().keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys6[0].auth, defaultKeyId);
    expect(keys7[0].valid).toBeFalsy();
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(keys7[1].valid).toBeTruthy();
  });

  it('apply revoke key is rejected trying to revoke the current signer key', () => {
    expect(() => {
      state.apply.revokeKey(5, defaultKeyId, did, null, defaultKeyId);
    }).toThrowError(`${defaultKeyId} cannot modify its own authorization (as ${defaultKeyId})`);
  });

  it('apply revoke key is rejected without proper rights', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    expect(() => {
      state.apply.revokeKey(6, keyId1, did, null, defaultKeyId);
    }).toThrowError(`${keyId1} has no right to update ${did} at height 6`);
  });

  it('revert revoke key works with valid data', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    state.apply.revokeKey(7, keyId1, did, null, defaultKeyId);
    state.revert.revokeKey(7, keyId1, did, null, defaultKeyId);

    const keys7 = state.query.getDidDocumentAt(did, 7).toData().keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    expect(keys7[0].valid).toBeTruthy();
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(keys7[1].valid).toBeTruthy();
  });

  it('revert revoke key is rejected with invalid data', () => {
    state.apply.addKey(5, defaultKeyId, did, null, keyId1);
    state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    state.apply.revokeKey(7, keyId1, did, null, defaultKeyId);

    expect(() => {
      state.revert.revokeKey(7, keyId1, did, null, keyId2);
    }).toThrowError(`Cannot revert revokeKey in DID ${did} because it does not have a key matching ${keyId2}`);
  });

  it('did can be tombstoned', () => {
    state.apply.tombstoneDid(5, defaultKeyId, did, null);

    const doc5 = state.query.getDidDocumentAt(did, 5);
    expect(doc5.isTombstonedAt(4)).toBeFalsy();
    expect(doc5.isTombstonedAt(5)).toBeTruthy();
  });

  it('did can only be tombstoned with key that has update right', () => {
    expect(() => {
      return state.apply.tombstoneDid(5, keyId1, did, null);
    }).toThrowError(
      `${keyId1} has no right to update ${did} at height ${5}`,
    );
  });

  it('tombstoned did can be reverted', () => {
    state.apply.tombstoneDid(5, defaultKeyId, did, null);
    expect(state.query.getDidDocumentAt(did, 5).isTombstonedAt(5)).toBeTruthy();

    state.revert.tombstoneDid(5, defaultKeyId, did, null);
    expect(state.query.getDidDocumentAt(did, 5).isTombstonedAt(5)).toBeFalsy();
  });

  it('tombstoned did cannot be updated', () => {
    state.apply.tombstoneDid(5, defaultKeyId, did, null);
    const error = `${defaultKeyId} cannot update ${did} at height 6. The DID is tombstoned`;
    expect(() => {
      state.apply.addKey(6, defaultKeyId, did, null, keyId1);
    }).toThrowError(error);
    expect(() => {
      state.apply.revokeKey(6, defaultKeyId, did, null, keyId1);
    }).toThrowError(error);
    expect(() => {
      state.apply.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    }).toThrowError(error);
    expect(() => {
      state.apply.revokeRight(6, defaultKeyId, did, null, keyId1, updateRight);
    }).toThrowError(error);
    expect(() => {
      state.apply.tombstoneDid(6, defaultKeyId, did, null);
    }).toThrowError(error);

    expect(() => {
      state.revert.addKey(6, defaultKeyId, did, null, keyId1);
    }).toThrowError(error);
    expect(() => {
      state.revert.revokeKey(6, defaultKeyId, did, null, keyId1);
    }).toThrowError(error);
    expect(() => {
      state.revert.addRight(6, defaultKeyId, did, null, keyId1, updateRight);
    }).toThrowError(error);
    expect(() => {
      state.revert.revokeRight(6, defaultKeyId, did, null, keyId1, updateRight);
    }).toThrowError(error);
  });

  it('keys in a tombstoned did have no rights', () => {
    state.apply.tombstoneDid(5, defaultKeyId, did, null);

    const doc5 = state.query.getDidDocumentAt(did, 5);
    expect(doc5.isTombstonedAt(5)).toBeTruthy();
    expect(doc5.hasRightAt(defaultKeyId, updateRight, 5)).toBeFalsy();
    expect(doc5.hasRightAt(defaultKeyId, impersonateRight, 5)).toBeFalsy();
  });
});
