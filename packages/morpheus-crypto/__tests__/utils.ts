import nodeCrypto from 'crypto';

export const installWindowCrypto = (): void => {
  // Thanks, Obama. https://github.com/jsdom/jsdom/issues/1612
  // jest acts as if tests run in a browser, but it does not support
  // most properties that browsers nowadays do :(
  /* eslint @typescript-eslint/no-explicit-any: 0 */
  ((window as unknown) as any).crypto = {
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
