import { IBeforeProofState } from "../src/interfaces/before-proof";
import { BeforeProofState } from "../src/morpheus-transaction/operations/before-proof/state";

describe('BeforeProofState', () => {
  let state: IBeforeProofState;
  beforeEach(() => {
    state = new BeforeProofState('contentId');
  });

  it('does not exist without registration ', () => {
    expect(state.query.existsAt(7)).toBeFalsy();
    expect(state.query.existsAt(undefined)).toBeFalsy();
  });

  it('does exist after registration ', () => {
    state.apply.register(5);

    expect(state.query.existsAt(4)).toBeFalsy();
    expect(state.query.existsAt(5)).toBeTruthy();
    expect(state.query.existsAt(7)).toBeTruthy();
    expect(state.query.existsAt(undefined)).toBeTruthy();
  });

})