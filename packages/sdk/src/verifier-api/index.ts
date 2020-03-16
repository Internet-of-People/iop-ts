import { IAfterProof, Did, ContentId, SignatureData, PublicKeyData } from '../interfaces/io';

export interface IValidationRequest {
  publicKey: PublicKeyData;
  contentId: ContentId;
  signature: SignatureData;
  onBehalfOf: Did;
  afterProof: IAfterProof | null;
}

export interface IValidationResult {
  errors: string[];
  warnings: string[];
}

export interface IVerifierApi {
  getAfterProof(): Promise<IAfterProof>;
  validate(request: IValidationRequest): Promise<IValidationResult>;
}
