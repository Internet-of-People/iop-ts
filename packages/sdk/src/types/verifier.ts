import * as Crypto from './crypto';
import * as Sdk from './sdk';

export interface IValidationRequest {
  publicKey: Crypto.PublicKeyData;
  contentId: Sdk.ContentId;
  signature: Crypto.SignatureData;
  onBehalfOf: Crypto.DidData;
  afterProof: Sdk.IAfterProof | null;
}

export interface IValidationResult {
  errors: string[];
  warnings: string[];
}

export interface IVerifierApi {
  getAfterProof(): Promise<Sdk.IAfterProof>;
  validate(request: IValidationRequest): Promise<IValidationResult>;
}
