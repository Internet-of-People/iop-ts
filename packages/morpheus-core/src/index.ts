export {
  Did,
  KeyId,
  PublicKey,
  Signature,
  SignedJson,
  SignedBytes,
  ValidationIssue,
  ValidationResult,
  Vault,
} from '../pkg';

import { KeyId, PublicKey } from './';

export type Authentication = KeyId | PublicKey;
export type KeyIdData = string; // Example "iezBlah"
export type PublicKeyData = string; // Example "pezFoo"
export type SignatureData = string; // Example "sezBar"
export type AuthenticationData = string; // Either "iezBlah" or "pezFoo"
export type DidData = string; // Example "did:morpheus:ezBlah"

export {
  IVault,
} from './interfaces';

export {
  PersistentVault,
} from './PersistentVault';

export {
  Bip39,
} from './Bip39';
