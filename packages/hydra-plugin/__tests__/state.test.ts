import { MorpheusState } from '../src/state';
import { IMorpheusState } from '../src/state-interfaces';

import { assertStringlyEqual, defaultKeyId, did, keyId1 } from './state-handler.test';

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

  it('default key can add new key', () => {
    state.apply.addKey(5, defaultKeyId, did, keyId1);

    const keys5 = state.query.getDidDocumentAt(did, 5).toData().keys;
    expect(keys5).toHaveLength(2);
    assertStringlyEqual(keys5[0].auth, defaultKeyId);
    assertStringlyEqual(keys5[1].auth, keyId1);

    const keys4 = state.query.getDidDocumentAt(did, 4).toData().keys;
    expect(keys4).toHaveLength(1);
    assertStringlyEqual(keys4[0].auth, defaultKeyId);
  });

  it('rejects add key done with unauthorized key', () => {
    expect(() => {
      return state.apply.addKey(5, keyId1, did, keyId1);
    })
      .toThrowError('Iez25N5WZ1Q6TQpgpyYgiu9gTX cannot update did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr at height 5');
  });

  it.todo('apply add right accepted for different key');
  it.todo('apply add right rejected for same key');
  it.todo('apply add right rejected because it existed');
  it.todo('revert add right accepted for different key');
});
