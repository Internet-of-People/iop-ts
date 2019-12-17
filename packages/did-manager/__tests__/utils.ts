export interface IToString {
  toString(): string;
}

export const assertStringlyEqual = (actual: IToString, expected: IToString): void => {
  expect(actual.toString()).toStrictEqual(expected.toString());
};

describe('Suppress Jest error on no tests here', () => {
  it('makes the CI happy', () => {
    expect(true).toBeTruthy();
  });
});
