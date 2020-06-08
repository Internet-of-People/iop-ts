import * as Crypto from '@internet-of-people/morpheus-crypto';

// Re-export from core because of Typescript. Yes, we know.
type Authentication = Crypto.Types.Authentication;
type AuthenticationData = Crypto.Types.AuthenticationData;
type DidData = Crypto.Types.DidData;
type IHydraParameters = Crypto.Types.IHydraParameters;
type IMorpheusParameters = Crypto.Types.IMorpheusParameters;
type IMorpheusSigner = Crypto.Types.IMorpheusSigner;
type IVaultState = Crypto.Types.IVaultState;
type KeyIdData = Crypto.Types.KeyIdData;
type Nonce = Crypto.Types.Nonce;
type PublicKeyData = Crypto.Types.PublicKeyData;
type SignatureData = Crypto.Types.SignatureData;
// Re-export from core because of Typescript. Yes, we know.

export {
  Authentication,
  AuthenticationData,
  DidData,
  IHydraParameters,
  IMorpheusParameters,
  IMorpheusSigner,
  IVaultState,
  KeyIdData,
  Nonce,
  PublicKeyData,
  SignatureData,
};
