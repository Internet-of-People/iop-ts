import { Crypto } from '@internet-of-people/sdk';

export const defaultDid = new Crypto.Did('did:morpheus:ezqztJ6XX6GDxdSgdiySiT3J');
export const did2 = new Crypto.Did('did:morpheus:ezj3chiV25iVVhXjv73mqk8Z');
export const did3 = new Crypto.Did('did:morpheus:ezxjqMH7vT8b8WFuKNSosYjo');
export const defaultKeyId = new Crypto.KeyId('iezqztJ6XX6GDxdSgdiySiT3J');
export const keyId2 = new Crypto.KeyId('iezj3chiV25iVVhXjv73mqk8Z');
export const keyId3 = new Crypto.KeyId('iezxjqMH7vT8b8WFuKNSosYjo');

describe('Suppress Jest error on no tests here', () => {
  it('makes the CI happy', () => {
    expect(true).toBeTruthy();
  });
});
