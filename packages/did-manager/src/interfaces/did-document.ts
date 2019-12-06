import { IState } from "./state";

export type Did = string;
export type KeyId = string;
export type PublicKey = string;
export type Authentication = KeyId | PublicKey;

export interface IKeyData {
  auth: Authentication;
  expiresAtHeight?: number;
  expired: boolean;
}

export interface IDidDocumentData {
  keys: IKeyData[];
}

export interface IDidDocument {
  canImpersonate(auth: Authentication): boolean;
  canUpdateDocument(auth: Authentication): boolean;

  toData(): IDidDocumentData;
  fromData(data: IDidDocumentData): void;
}

export interface IDidDocumentQueries {
  getAt(height: number): IDidDocument;
}

export interface IDidDocumentOperations {
  addKey(auth: Authentication, expiresAtHeight: number | undefined, height: number): void;
}

export type IDidDocumentState = IState<IDidDocumentQueries, IDidDocumentOperations>;
