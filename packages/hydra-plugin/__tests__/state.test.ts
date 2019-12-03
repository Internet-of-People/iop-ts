import { IMorpheusState, MorpheusState } from "../src/state";

describe.only('Cloneable', () => {
  it('actually works', () => {
    const contentId = "contentId";
    const contentIdOther = "contentIdOther";

    const oldState = new MorpheusState();
    oldState.apply.registerBeforeProof(contentIdOther, 5);

    const newState = oldState.clone();
    expect(newState).not.toBe(oldState);

    newState.apply.registerBeforeProof(contentId, 5);
    console.log(oldState);
    console.log(newState);

    expect(oldState.query.beforeProofExistsAt(contentIdOther, 5)).toBeTruthy();
    expect(newState.query.beforeProofExistsAt(contentIdOther, 5)).toBeTruthy();

    expect(oldState.query.beforeProofExistsAt(contentId, 5)).toBeFalsy();
    expect(newState.query.beforeProofExistsAt(contentId, 5)).toBeTruthy();

    expect(oldState.query.beforeProofExistsAt(contentId, 7)).toBeTruthy();
    oldState.apply.revokeBeforeProof(contentIdOther,7);
    expect(oldState.query.beforeProofExistsAt(contentIdOther, 7)).toBeFalsy();
    expect(newState.query.beforeProofExistsAt(contentIdOther, 7)).toBeTruthy();
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
    expect(state.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();
  });

  it('rejects before proof with old block height', () => {
    state.apply.registerBeforeProof(contentId, 5);
    expect( () => state.apply.registerBeforeProof(contentId, 3)).toThrowError('value was already set at that height');
  });

  it('rejects before proof with already registered content id', () => {
    state.apply.registerBeforeProof(contentId, 5);
    expect( () => state.apply.registerBeforeProof(contentId, 7)).toThrowError(`Before proof ${contentId} is already registered at 7`);
  });
});