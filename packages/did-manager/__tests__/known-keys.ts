import { Crypto } from '@internet-of-people/sdk';

export interface IToString {
  toString(): string;
}

export const assertStringlyEqual = (actual: IToString, expected: IToString): void => {
  expect(actual.toString()).toStrictEqual(expected.toString());
};

export const did = new Crypto.Did('did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr');
export const defaultKeyId = new Crypto.KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
export const keyId1 = new Crypto.KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
export const keyId2 = new Crypto.KeyId('iezkXs7Xd8SDWLaGKUAjEf53W');

describe('Suppress Jest error on no tests here', () => {
  it('makes the CI happy', () => {
    expect(true).toBeTruthy();
  });
});
