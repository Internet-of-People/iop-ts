import { SignedMessage } from '../pkg';

export interface IVault {
  sign(message: Uint8Array, did: string): SignedMessage;
}
