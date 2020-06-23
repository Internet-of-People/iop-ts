import { KeyId, PublicKey, SignedBytes } from '@internet-of-people/morpheus-crypto-wasm';

export interface IMorpheusSigner {
  signDidOperations(id: KeyId, message: Uint8Array): SignedBytes;
}

export type Authentication = KeyId | PublicKey;
export type Nonce = string; // Example "uSomething"
export type DidData = string; // Example "did:morpheus:ezBlah"
export type KeyIdData = string; // Example "iezBlah"
export type PublicKeyData = string; // Example "pezFoo"
export type SignatureData = string; // Example "sezBar"
export type AuthenticationData = string; // Either "iezBlah" or "pezFoo"

