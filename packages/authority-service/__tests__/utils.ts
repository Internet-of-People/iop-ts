import nodeCrypto from 'crypto';

export interface IToString {
  toString(): string;
}

export const assertStringlyEqual = (actual: IToString, expected: IToString): void => {
  expect(actual.toString()).toStrictEqual(expected.toString());
};

export const installWindowCrypto = (): void => {
  // Thanks, Obama. https://github.com/jsdom/jsdom/issues/1612
  // jest acts as if tests run in a browser, but it does not support
  // most properties that browsers nowadays do :(
  /* eslint @typescript-eslint/no-explicit-any: 0 */
  ((global as unknown) as any).crypto = {
    getRandomValues: (b: NodeJS.ArrayBufferView): void => {
      nodeCrypto.randomFillSync(b);
    },
  };
};

describe('Suppress Jest error on no tests here', () => {
  it('makes the CI happy', () => {
    expect(true).toBeTruthy();
  });
});
