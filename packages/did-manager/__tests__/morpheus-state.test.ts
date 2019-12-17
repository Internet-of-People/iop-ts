import { MorpheusState } from '../src/morpheus-transaction/state';
import { IMorpheusState, Right } from '../src/interfaces';

import { assertStringlyEqual, defaultKeyId, did, keyId1, keyId2 } from './morpheus-state-handler.test';

describe('Cloneable', () => {
  it('actually works', () => {
    const newContentId = 'newContentId';
    const oldContentId = 'oldContentId';

    const oldState = new MorpheusState();
    oldState.apply.registerBeforeProof(oldContentId, 5);

    const newState = oldState.clone();
    expect(newState).not.toBe(oldState);

    newState.apply.registerBeforeProof(newContentId, 5);

    expect(oldState.query.beforeProofExistsAt(oldContentId, 5)).toBeTruthy();
    expect(newState.query.beforeProofExistsAt(oldContentId, 5)).toBeTruthy();

    expect(oldState.query.beforeProofExistsAt(newContentId, 5)).toBeFalsy();
    expect(newState.query.beforeProofExistsAt(newContentId, 5)).toBeTruthy();

    expect(oldState.query.beforeProofExistsAt(oldContentId, 7)).toBeTruthy();
    oldState.apply.revokeBeforeProof(oldContentId, 7);
    expect(oldState.query.beforeProofExistsAt(oldContentId, 7)).toBeFalsy();
    expect(newState.query.beforeProofExistsAt(oldContentId, 7)).toBeTruthy();
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
    state.apply.addKey(5, defaultKeyId, did, keyId1);

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
      return state.apply.addKey(5, keyId1, did, keyId1);
    })
      .toThrowError('Iez25N5WZ1Q6TQpgpyYgiu9gTX cannot update did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr at height 5');
  });

  it('revert add key works with valid data', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    state.revert.addKey(5, defaultKeyId, did, keyId1);

    const keys5 = state.query.getDidDocumentAt(did, 5).toData().keys;
    expect(keys5).toHaveLength(1);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    expect(keys5[0].valid).toBeTruthy();
  });

  it('revert add key throws with invalid data', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    expect(() => {
      state.revert.addKey(5, defaultKeyId, did, defaultKeyId);
    }).toThrowError(
      `Cannot revert addKey in DID did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr, 
      because the key does not match the last added one`,
    );
  });

  it('apply add right accepted for different key', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    state.apply.addRight(7, defaultKeyId, did, keyId1, Right.Update);

    const data7 = state.query.getDidDocumentAt(did, 7).toData();
    const keys7 = data7.keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    assertStringlyEqual(keys7[1].auth, keyId1);
    const rights7 = data7.rights;
    expect(rights7.get(Right.Impersonate)).toStrictEqual([0]);
    expect(rights7.get(Right.Update)).toStrictEqual([ 0, 1 ]);

    const data5 = state.query.getDidDocumentAt(did, 5).toData();
    const keys5 = data5.keys;
    expect(keys5).toHaveLength(2);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    expect(keys5[0].valid).toBeTruthy();
    assertStringlyEqual(keys5[1].auth, keyId1);
    expect(keys5[1].valid).toBeTruthy();
    const rights5 = data5.rights;
    expect(rights5.get(Right.Impersonate)).toStrictEqual([0]);
    expect(rights5.get(Right.Update)).toStrictEqual([0]);
  });

  it('apply add right rejected for same key', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    expect(() => {
      state.apply.addRight(6, keyId1, did, keyId1, Right.Update);
    }).toThrowError('Iez25N5WZ1Q6TQpgpyYgiu9gTX cannot update did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr at height 6');
  });

  it.todo('apply add right rejected because it existed');

  it.todo('revert add right accepted for different key');

  it.todo('apply revoke right accepted for different key');

  it.todo('apply revoke right rejected for same key');

  it.todo('apply revoke right rejected because it existed');

  it.todo('revert revoke right accepted for different key');

  it('apply revoke key works with appropriate rights', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    state.apply.addRight(6, defaultKeyId, did, keyId1, Right.Update);
    state.apply.revokeKey(7, keyId1, did, defaultKeyId);

    const keys6 = state.query.getDidDocumentAt(did, 6).toData().keys;
    expect(keys6).toHaveLength(2);
    assertStringlyEqual(keys6[0].auth, defaultKeyId);
    expect(keys6[0].valid).toBeTruthy();
    assertStringlyEqual(keys6[1].auth, keyId1);
    expect(keys6[1].valid).toBeTruthy();

    const keys7 = state.query.getDidDocumentAt(did, 7).toData().keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys6[0].auth, defaultKeyId);
    expect(keys7[0].revoked).toBeTruthy();
    expect(keys7[0].valid).toBeFalsy();
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(keys7[1].valid).toBeTruthy();
  });

  it('apply revoke key is rejected trying to revoke the current signer key', () => {
    expect(() => {
      state.apply.revokeKey(5, defaultKeyId, did, defaultKeyId);
    }).toThrowError('IezbeWGSY2dqcUBqT8K7R14xr cannot modify its own authorization (as IezbeWGSY2dqcUBqT8K7R14xr)');
  });

  it('apply revoke key is rejected without proper rights', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    expect(() => {
      state.apply.revokeKey(6, keyId1, did, defaultKeyId);
    }).toThrowError('Iez25N5WZ1Q6TQpgpyYgiu9gTX cannot update did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr at height 6');
  });

  it('revert revoke key works with valid data', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    state.apply.addRight(6, defaultKeyId, did, keyId1, Right.Update);
    state.apply.revokeKey(7, keyId1, did, defaultKeyId);
    state.revert.revokeKey(7, keyId1, did, defaultKeyId);

    const keys7 = state.query.getDidDocumentAt(did, 7).toData().keys;
    expect(keys7).toHaveLength(2);
    assertStringlyEqual(keys7[0].auth, defaultKeyId);
    expect(keys7[0].valid).toBeTruthy();
    assertStringlyEqual(keys7[1].auth, keyId1);
    expect(keys7[1].valid).toBeTruthy();
  });

  it('revert revoke key is rejected with invalid data', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);
    state.apply.addRight(6, defaultKeyId, did, keyId1, Right.Update);
    state.apply.revokeKey(7, keyId1, did, defaultKeyId);

    expect(() => {
      state.revert.revokeKey(7, keyId1, did, keyId2);
    }).toThrowError(
      `Cannot revert revokeKey in DID did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr 
      because it does not have a key matching IezkXs7Xd8SDWLaGKUAjEf53W`,
    );
  });
});
