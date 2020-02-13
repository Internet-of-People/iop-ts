import { HashType, hashAsBuffer } from 'bigint-hash';
import multibase from 'multibase';
import { randomBytes } from 'crypto';

import { canonicalJson } from './canonicalJson';

export interface IContent {
  nonce?: Nonce;
}

export interface IDynamicContent extends IContent {
  [key: string]: unknown;
  schema?: Content<IDynamicContent>;
}

export type ContentId = string; // Example "cjuFoobar"
export type Content<T extends IContent> = ContentId | T; // Example "cjuFoobar" or "{something:42,whatever:\"cool\"}"
export type Did = string; // Example "did:morpheus:ezBlah"
export type PublicKey = string; // Example "pezFoo"
export type Signature = string; // Example "sezBar"
export type Nonce = string; // Example "zSomething"
export type KeyLink = string; // Example "did:morpheus:ezBlah#1"
export type DateTime = string; // ISO8601-datetime like "20200206T130419Z"

export interface IProcess extends IContent {
  name: string;
  version: number;
  description: string;
  claimSchema: Content<IDynamicContent>;
  evidenceSchema: Content<IDynamicContent> | null;
  constraintsSchema: Content<IDynamicContent> | null;
}

export interface ISignature {
  publicKey: PublicKey;
  bytes: Signature;
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
  claim: IClaim;
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
  claim: Content<IClaim>;
  statements: ISigned<IWitnessStatement>[];
}

export interface ILicense {
  issuedTo: Did;
  purpose: string;
  expiry: DateTime;
}

export interface IPresentation extends IContent {
  claims: IProvenClaim[];
  licenses: ILicense[];
}

export interface ISigned<T extends IContent> extends IContent {
  signature: ISignature;
  content: Content<T>;
}

export const defaultDigest = (json: string): string => {
  const hash = hashAsBuffer(HashType.SHA3_256, Buffer.from(json, 'utf8'));
  return `cj${ multibase.encode('base64url', hash)}`;
};

/**
 * Calculates the ContentId of any content representible as a JSON object.
 * The calculation collapses complex structures by recursively replacing
 * leaf object values with their ContentId. When it finds a cycle among the
 * objects, it throws an exception.
 *
 * @param content Any object, but not an array or a string
 */
export const jsonDigest = <T extends IContent>(content: T): ContentId => {
  return JSON.parse(canonicalJson(content, defaultDigest));
};

/**
 * Produces a 45 character string with 264 bits of entropy to be used as a nonce.
 */
export const nonce264 = (): Nonce => {
  const buf = randomBytes(33); // produces 44 full symbols of base64
  return multibase.encode('base64url', buf).toString('ascii');
};
