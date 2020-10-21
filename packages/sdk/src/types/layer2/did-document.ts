import { Did } from '@internet-of-people/morpheus-crypto';
import * as Crypto from '../crypto';
import * as Sdk from '../sdk';

export interface IKeyData {
  // TODO an additional "type" property should return something
  // like "KeyId-ed25519-Base58" for auth that starts with "iez"
  index: number;
  auth: Crypto.AuthenticationData;
  validFromHeight: number | null;
  validUntilHeight: number | null;
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

// Not kidding: https://github.com/Microsoft/TypeScript/issues/24220
export type IRightsMap<T> = {[right in Sdk.Right]: T};

export interface IKeyRightHistoryPoint {
  height: number | null;
  valid: boolean;
}

export interface IKeyRightHistory {
  keyLink: string;
  history: IKeyRightHistoryPoint[];
  valid: boolean; // NOTE: contains derived information based on other fields and `atHeight`
}

// The interface that the layer-2 will return to clients
export interface IDidDocumentData {
  did: Crypto.DidData;
  keys: IKeyData[];
  rights: IRightsMap<IKeyRightHistory[]>; // contains key indexes from the keys property
  tombstonedAtHeight: number | null;
  tombstoned: boolean; // NOTE: contains derived information based on other fields and `atHeight`
  queriedAtHeight: number;
}

export interface IDidDocument {
  readonly height: number;
  readonly did: Did;

  hasRightAt(auth: Crypto.Authentication, right: Sdk.Right, height: number): boolean;
  isTombstonedAt(height: number): boolean;

  toData(): IDidDocumentData;
  fromData(data: IDidDocumentData): void;
}
