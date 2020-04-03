import * as Crypto from './crypto';

export interface IContent {
  nonce?: Crypto.Nonce;
}

export type ContentId = string; // Example "cjuFoobar"
export type Content<T extends IContent> = ContentId | T; // Example "cjuFoobar" or "{something:42,whatever:\"cool\"}"
export type KeyLink = string; // Example "did:morpheus:ezBlah#1"
export type DateTime = string; // ISO8601-datetime like "20200206T130419Z"
export type Duration = string; // ISO8601-duration like "P5M"

export type TransactionId = string;
export type Right = string;

export interface IDynamicContent extends IContent {
  [key: string]: unknown;
  schema?: Content<IDynamicContent>;
}

export interface IProcess extends IContent {
  name: string;
  version: number;
  description: string;
  claimSchema: Content<IDynamicContent>;
  evidenceSchema: Content<IDynamicContent> | null;
  constraintsSchema: Content<IDynamicContent> | null;
}

export interface ISignature {
  publicKey: Crypto.PublicKeyData;
  bytes: Crypto.SignatureData;
}

export interface IClaim extends IContent {
  subject: Crypto.DidData;
  content: Content<IDynamicContent>;
}

export interface IWitnessRequest extends IContent {
  claim: IClaim;
  claimant: KeyLink;
  processId: ContentId; // IProcess
  evidence: Content<IDynamicContent> | null;
}

export interface IWitnessStatement extends IContent {
  claim: Content<IClaim>;
  processId: ContentId; // IProcess
  constraints: {
    after: DateTime | null;
    before: DateTime | null;
    witness: KeyLink;
    authority: Crypto.DidData;
    content: Content<IDynamicContent> | null;
  };
}

export interface IProvenClaim {
  claim: IClaim;
  statements: ISigned<IWitnessStatement>[];
}

export interface ILicense {
  issuedTo: Crypto.DidData;
  purpose: string;
  validFrom: DateTime;
  validUntil: DateTime;
}

export interface IPresentation extends IContent {
  provenClaims: IProvenClaim[];
  licenses: ILicense[];
}

export interface ISigned<T extends IContent> extends IContent {
  signature: ISignature;
  content: Content<T | IAfterEnvelope<T>>;
}

export interface IPrerequisite {
  process: Content<IProcess>;
  claimFields: string[];
}

export interface ILicenseSpecification {
  issuedTo: Crypto.DidData;
  purpose: string;
  expiry: Duration;
}

export interface IScenario extends IContent {
  name: string;
  version: number;
  description: string;
  prerequisites: IPrerequisite[];
  requiredLicenses: ILicenseSpecification[];
  resultSchema: Content<IDynamicContent> | null;
}

export interface IAfterProof {
  blockHeight: number;
  blockHash: string;
}

export interface IAfterEnvelope<T extends IContent> extends IContent {
  content: Content<T>;
  afterProof: IAfterProof;
}
