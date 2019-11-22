import { DidManager } from '../src/index';

describe('Test', () => {
  it('testing hello', () => {
    expect(DidManager.getHello()).toStrictEqual('HELLO!');
  });
});