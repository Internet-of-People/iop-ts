import { KeyId, PublicKey } from '@internet-of-people/keyvault';
import { IState } from './state';

export type TransactionId = string;
export type Did = string;
export type Authentication = KeyId | PublicKey;
export type AuthenticationData = string;
export type Right = string;

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
export const MULTICIPHER_KEYID_PREFIX = KeyId.prefix();

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

export interface IKeyData {
  // TODO an additional "type" property should return something
  // like "KeyId-ed25519-Base58" for auth that starts with "iez"
  index: number;
  auth: AuthenticationData;
  validFromHeight: number | null;
  validUntilHeight: number | null;
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

// Not kidding: https://github.com/Microsoft/TypeScript/issues/24220
export type IRightsMap<T> = {[right in Right]: T};

export interface IKeyRightHistoryPoint {
  height: number | null;
  valid: boolean;
}

export interface IKeyRightHistory {
  keyLink: string;
  history: IKeyRightHistoryPoint[];
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

// The interface that the Layer-2 will return to clients
export interface IDidDocumentData {
  did: Did;
  keys: IKeyData[];
  rights: IRightsMap<IKeyRightHistory[]>; // contains key indexes from the keys property
  tombstonedAtHeight: number | null;
  tombstoned: boolean; // NOTE: contains derived information based on other fields and `atHeight`
  queriedAtHeight: number;
}

export interface IDidDocument {
  readonly height: number;
  readonly did: Did;

  hasRightAt(auth: Authentication, right: Right, height: number): boolean;
  isTombstonedAt(height: number): boolean;

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


export interface IDidTransactionsQueries {
  getBetween(did: Did, fromHeightInc: number, untilHeightExc?: number): TransactionId[];
}

export interface IDidTransactionsOperations {
  registerOperationAttempt(height: number, did: Did, transactionId: TransactionId): void;
}

export type IDidTransactionsState = IState<IDidTransactionsQueries, IDidTransactionsOperations>;
