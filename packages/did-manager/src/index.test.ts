import { DidManager } from './index';

describe('Test', () => {
  it('testing hello', () => {
    expect(DidManager.getHello()).toStrictEqual('HELLO!');
  });
});