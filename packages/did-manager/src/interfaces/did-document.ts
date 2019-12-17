import { KeyId, PublicKey } from '@internet-of-people/keyvault';
import { IState } from './state';

export type Did = string;
export type Authentication = KeyId | PublicKey;
export type AuthenticationData = string;

export const isSameAuthentication = (left: Authentication, right: Authentication): boolean => {
  // NOTE ugly implementation of double dispatch for both params
  if (left instanceof PublicKey) {
    if (right instanceof KeyId) {
      return left.validateId(right);
    } else {
      return left.toString() === right.toString();
    }
  } else {
    if (right instanceof KeyId) {
      return left.toString() === right.toString();
    } else {
      return right.validateId(left);
    }
  }
};

export const MORPHEUS_DID_PREFIX = 'did:morpheus:';
export const MULTICIPHER_KEYID_PREFIX = 'I';

export const didToAuth = (did: Did): Authentication => {
  const keyId = did.replace(new RegExp(`^${MORPHEUS_DID_PREFIX}`), MULTICIPHER_KEYID_PREFIX);
  return new KeyId(keyId);
};

// NOTE throws if conversion failed
export const authenticationFromData = (data: AuthenticationData): Authentication => {
  if (data.startsWith(MULTICIPHER_KEYID_PREFIX)) {
    return new KeyId(data);
  } else {
    return new PublicKey(data);
  }
};

export enum Right {
  Impersonate = 'impersonate',
  Update = 'update',
}

export interface IKeyData {
  auth: AuthenticationData;
  validFromHeight?: number;
  validUntilHeight?: number;
  revoked: boolean;
  valid: boolean; // NOTE: contains aggregated information derived from other fields
}

// TODO: this will be returned to the user basically. Please then follow the structure defined here:
// https://iop-stack.gitlab.iop-ventures.com/dids-and-claims/specification/#/glossary?id=did-document
// or create a DTO for it
export interface IDidDocumentData {
  did: Did;
  keys: IKeyData[];
  rights: Map<Right, number[]>; // contains key indexes from the keys property
  atHeight: number;
  tombstoned: boolean;
}

export interface IDidDocument {
  readonly height: number;
  readonly did: Did;

  hasRight(auth: Authentication, right: Right): boolean;
  isTombstoned(): boolean;

  toData(): IDidDocumentData;
  fromData(data: IDidDocumentData): void;
}

export interface IDidDocumentQueries {
  getAt(height: number): IDidDocument;
}

export interface IDidDocumentOperations {
  addKey(height: number, auth: Authentication, expiresAtHeight?: number): void;
  revokeKey(height: number, auth: Authentication): void;
  addRight(height: number, auth: Authentication, right: Right): void;
  revokeRight(height: number, auth: Authentication, right: Right): void;
  tombstone(height: number): void;
}

export type IDidDocumentState = IState<IDidDocumentQueries, IDidDocumentOperations>;
