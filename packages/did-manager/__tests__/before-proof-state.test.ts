import { IBeforeProofState } from '../src/interfaces';
import { BeforeProofState } from '../src/morpheus-transaction/operations/before-proof';

describe('Cloning BeforeProofState', () => {
  let oldProof: IBeforeProofState;
  let newProof: IBeforeProofState;
  beforeEach(() => {
    oldProof = new BeforeProofState('contentId');
    oldProof.apply.register(5);
    newProof = oldProof.clone();
  });

  it('existing proof is cloned', () => {
    expect(newProof.query.existsAt(5)).toBeTruthy();
  });

  it('removing proof from old does not affect clone', () => {
    oldProof.revert.register(5);
    expect(oldProof.query.existsAt(5)).toBeFalsy();
    expect(newProof.query.existsAt(5)).toBeTruthy();
  });

  it('removing proof from clone does not affect old one', () => {
    newProof.revert.register(5);
    expect(newProof.query.existsAt(5)).toBeFalsy();
    expect(oldProof.query.existsAt(5)).toBeTruthy();
  });

  it('revoking proof does not affect old one', () => {
    newProof.apply.revoke(7);
    expect(newProof.query.existsAt(7)).toBeFalsy();
    expect(oldProof.query.existsAt(7)).toBeTruthy();
  });
});


describe('BeforeProofState', () => {
  let state: IBeforeProofState;
  beforeEach(() => {
    state = new BeforeProofState('contentId');
  });

  it('does not exist without registration ', () => {
    expect(state.query.existsAt(7)).toBeFalsy();
    /* eslint no-undefined: 0 */
    expect(state.query.existsAt(undefined)).toBeFalsy();
  });

  it('does exist after registration ', () => {
    state.apply.register(5);

    expect(state.query.existsAt(4)).toBeFalsy();
    expect(state.query.existsAt(5)).toBeTruthy();
    expect(state.query.existsAt(7)).toBeTruthy();
    /* eslint no-undefined: 0 */
    expect(state.query.existsAt(undefined)).toBeTruthy();
  });
});
