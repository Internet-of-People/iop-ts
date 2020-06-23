import * as Crypto from '@internet-of-people/morpheus-crypto';

// Re-export from core because of Typescript. Yes, we know.
type Authentication = Crypto.Types.Authentication;
type AuthenticationData = Crypto.Types.AuthenticationData;
type DidData = Crypto.Types.DidData;
type IMorpheusSigner = Crypto.Types.IMorpheusSigner;
type KeyIdData = Crypto.Types.KeyIdData;
type Nonce = Crypto.Types.Nonce;
type PublicKeyData = Crypto.Types.PublicKeyData;
type SignatureData = Crypto.Types.SignatureData;
// Re-export from core because of Typescript. Yes, we know.

export {
  Authentication,
  AuthenticationData,
  DidData,
  IMorpheusSigner,
  KeyIdData,
  Nonce,
  PublicKeyData,
  SignatureData,
};
