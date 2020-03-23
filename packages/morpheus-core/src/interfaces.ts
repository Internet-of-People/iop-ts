import { KeyId, SignedBytes } from './';

export interface IVault {
  signDidOperations(id: KeyId, message: Uint8Array): SignedBytes;
}
