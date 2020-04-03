import { KeyId, PublicKey, SignedBytes } from '../pkg';

export interface IVault {
  signDidOperations(id: KeyId, message: Uint8Array): SignedBytes;
}

export type Authentication = KeyId | PublicKey;
export type AuthenticationData = string; // Either "iezBlah" or "pezFoo"
export type DidData = string; // Example "did:morpheus:ezBlah"
export type KeyIdData = string; // Example "iezBlah"
export type Nonce = string; // Example "uSomething"
export type PublicKeyData = string; // Example "pezFoo"
export type SignatureData = string; // Example "sezBar"
