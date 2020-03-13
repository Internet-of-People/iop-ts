import { IAfterProof, Did, ContentId, AuthenticationData } from '../interfaces/io';

export interface IValidationRequest {
  onBehalfOf: Did;
  auth: AuthenticationData;
  beforeProof: ContentId | null;
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
