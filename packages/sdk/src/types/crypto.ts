import * as Crypto from '@internet-of-people/morpheus-crypto';

// Re-export from core because of Typescript. Yes, we know.
type Authentication = Crypto.Types.Authentication;
type AuthenticationData = Crypto.Types.AuthenticationData;
type DidData = Crypto.Types.DidData;
type IHydraContext = Crypto.Types.IHydraContext;
type IHydraParameters = Crypto.Types.IHydraParameters;
type IMorpheusContext = Crypto.Types.IMorpheusContext;
type IMorpheusSigner = Crypto.Types.IMorpheusSigner;
type IVaultContext = Crypto.Types.IVaultContext;
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
  IHydraContext,
  IHydraParameters,
  IMorpheusContext,
  IMorpheusSigner,
  IVaultContext,
  IVaultState,
  KeyIdData,
  Nonce,
  PublicKeyData,
  SignatureData,
};
