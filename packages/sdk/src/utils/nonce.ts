import multibase from 'multibase';
import { randomBytes } from 'crypto';
import { Nonce } from '../interfaces/io';

/**
 * Produces a 45 character string with 264 bits of entropy to be used as a nonce.
 */
export const nonce264 = (): Nonce => {
  const buf = randomBytes(33); // produces 44 full symbols of base64
  return multibase.encode('base64url', buf).toString('ascii');
};
