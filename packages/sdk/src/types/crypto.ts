import * as Crypto from '@internet-of-people/morpheus-crypto';

// Re-export from core because of Typescript. Yes, we know.
type Authentication = Crypto.Types.Authentication;
type AuthenticationData = Crypto.Types.AuthenticationData;
type DidData = Crypto.Types.DidData;
type IVault = Crypto.Types.IVault;
type KeyIdData = Crypto.Types.KeyIdData;
type Nonce = Crypto.Types.Nonce;
type PublicKeyData = Crypto.Types.PublicKeyData;
type SignatureData = Crypto.Types.SignatureData;
// Re-export from core because of Typescript. Yes, we know.

export {
  Authentication,
  AuthenticationData,
  DidData,
  IVault,
  KeyIdData,
  Nonce,
  PublicKeyData,
  SignatureData,
};
