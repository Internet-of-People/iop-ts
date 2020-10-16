import multibase from 'multibase';

import { encrypt as encryptRust, decrypt as decryptRust } from '@internet-of-people/sdk-wasm';

export const encrypt = encryptRust;
export const decrypt = decryptRust;

export const encryptString = (plainText: string, password: string): string => {
  const plainData = Uint8Array.from(Buffer.from(plainText, 'utf8'));
  const cipherData = encryptRust(plainData, password);
  return multibase.encode('base64url', Buffer.from(cipherData)).toString('ascii');
};

export const decryptString = (cipherText: string, password: string): string => {
  const cipherData = Uint8Array.from(multibase.decode(cipherText));
  const plainData = decryptRust(cipherData, password);
  return Buffer.from(plainData).toString('utf8');
};
