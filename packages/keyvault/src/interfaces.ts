import { KeyId, SignedMessage } from '../pkg';

export interface IVault {
  sign(message: Uint8Array, id: KeyId): SignedMessage;
}
