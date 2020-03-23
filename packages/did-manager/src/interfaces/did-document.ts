import { KeyId, PublicKey } from '@internet-of-people/morpheus-core';
import { IO } from '@internet-of-people/sdk';
import { IState } from './state';

export interface ITransactionIdHeight {
  transactionId: IO.TransactionId;
  height: number;
}

export const isSameAuthentication = (left: IO.Authentication, right: IO.Authentication): boolean => {
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

export interface IKeyData {
  // TODO an additional "type" property should return something
  // like "KeyId-ed25519-Base58" for auth that starts with "iez"
  index: number;
  auth: IO.AuthenticationData;
  validFromHeight: number | null;
  validUntilHeight: number | null;
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

// Not kidding: https://github.com/Microsoft/TypeScript/issues/24220
export type IRightsMap<T> = {[right in IO.Right]: T};

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
  did: IO.Did;
  keys: IKeyData[];
  rights: IRightsMap<IKeyRightHistory[]>; // contains key indexes from the keys property
  tombstonedAtHeight: number | null;
  tombstoned: boolean; // NOTE: contains derived information based on other fields and `atHeight`
  queriedAtHeight: number;
}

export interface IDidDocument {
  readonly height: number;
  readonly did: IO.Did;

  hasRightAt(auth: IO.Authentication, right: IO.Right, height: number): boolean;
  isTombstonedAt(height: number): boolean;

  toData(): IDidDocumentData;
  fromData(data: IDidDocumentData): void;
}

export interface IDidDocumentQueries {
  getAt(height: number): IDidDocument;
}

export interface IDidDocumentOperations {
  addKey(height: number, auth: IO.Authentication, expiresAtHeight?: number): void;
  revokeKey(height: number, auth: IO.Authentication): void;
  addRight(height: number, auth: IO.Authentication, right: IO.Right): void;
  revokeRight(height: number, auth: IO.Authentication, right: IO.Right): void;
  tombstone(height: number): void;
}

export type IDidDocumentState = IState<IDidDocumentQueries, IDidDocumentOperations>;


export interface IDidTransactionsQueries {
  getBetween(did: IO.Did, fromHeightInc: number, untilHeightExc?: number): ITransactionIdHeight[];
}

export interface IDidTransactionsOperations {
  registerOperationAttempt(height: number, did: IO.Did, transactionId: IO.TransactionId): void;
}

export type IDidTransactionsState = IState<IDidTransactionsQueries, IDidTransactionsOperations>;
