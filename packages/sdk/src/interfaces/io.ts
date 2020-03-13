import { KeyId, PublicKey } from '@internet-of-people/keyvault';

export type Authentication = KeyId | PublicKey;

export type KeyIdData = string; // Example "iezBlah"
export type PublicKeyData = string; // Example "pezFoo"
export type SignatureData = string; // Example "sezBar"
export type AuthenticationData = string; // Either "iezBlah" or "pezFoo"
export type TransactionId = string;
export type Did = string; // Example "did:morpheus:ezBlah"
export type Right = string;

export interface IContent {
  nonce?: Nonce;
}

export interface IDynamicContent extends IContent {
  [key: string]: unknown;
  schema?: Content<IDynamicContent>;
}

export type ContentId = string; // Example "cjuFoobar"
export type Content<T extends IContent> = ContentId | T; // Example "cjuFoobar" or "{something:42,whatever:\"cool\"}"
export type Nonce = string; // Example "zSomething"
export type KeyLink = string; // Example "did:morpheus:ezBlah#1"
export type DateTime = string; // ISO8601-datetime like "20200206T130419Z"
export type Duration = string; // ISO8601-duration like "P5M"

export interface IProcess extends IContent {
  name: string;
  version: number;
  description: string;
  claimSchema: Content<IDynamicContent>;
  evidenceSchema: Content<IDynamicContent> | null;
  constraintsSchema: Content<IDynamicContent> | null;
}

export interface ISignature {
  publicKey: PublicKeyData;
  bytes: SignatureData;
}

export interface IClaim extends IContent {
  subject: Did;
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
    authority: Did;
    content: Content<IDynamicContent> | null;
  };
}

export interface IProvenClaim {
  claim: IClaim;
  statements: ISigned<IWitnessStatement>[];
}

export interface ILicense {
  issuedTo: Did;
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
  issuedTo: Did;
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


export const MORPHEUS_DID_PREFIX = 'did:morpheus:';
export const MULTICIPHER_KEYID_PREFIX = KeyId.prefix();

export const didToAuth = (did: Did): Authentication => {
  const keyId = did.replace(new RegExp(`^${MORPHEUS_DID_PREFIX}`), MULTICIPHER_KEYID_PREFIX);
  return new KeyId(keyId);
};

/** NOTE throws if conversion failed */
export const authenticationFromData = (data: AuthenticationData): Authentication => {
  if (data.startsWith(MULTICIPHER_KEYID_PREFIX)) {
    return new KeyId(data);
  } else {
    return new PublicKey(data);
  }
};