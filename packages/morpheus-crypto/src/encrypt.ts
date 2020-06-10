import { randomBytes } from 'crypto';
import multibase from 'multibase';

import { encrypt as encryptRust, decrypt as decryptRust } from '@internet-of-people/morpheus-crypto-wasm';

export const encrypt = (plainText: Uint8Array, password: string): Uint8Array => {
  const nonce = Uint8Array.from(randomBytes(24));
  return encryptRust(plainText, password, nonce);
};

export const decrypt = decryptRust;

export const encryptString = (plainText: string, password: string): string => {
  const plainData = Uint8Array.from(Buffer.from(plainText, 'utf8'));
  const cipherData = encrypt(plainData, password);
  return multibase.encode('base64url', Buffer.from(cipherData)).toString('ascii');
};

export const decryptString = (cipherText: string, password: string): string => {
  const cipherData = Uint8Array.from(multibase.decode(cipherText));
  const plainData = decrypt(cipherData, password);
  return Buffer.from(plainData).toString('utf8');
};
