import {KeyId, PublicKey} from '@internet-of-people/keyvault';
import { IState } from './state';

export type Did = string;
export type Authentication = KeyId | PublicKey;

export interface IKeyData {
  auth: Authentication;
  expiresAtHeight?: number;
  expired: boolean;
}

// TODO: this will be returned to the user basically. Please then follow the structure defined here:
// https://iop-stack.gitlab.iop-ventures.com/dids-and-claims/specification/#/glossary?id=did-document
// or create a DTO for it
export interface IDidDocumentData {
  did: Did;
  keys: IKeyData[];
  atHeight: number;
}

export interface IDidDocument {
  getHeight(): number;
  canImpersonate(auth: Authentication): boolean;
  canUpdateDocument(auth: Authentication): boolean;

  toData(): IDidDocumentData;
  fromData(data: IDidDocumentData): void;
}

export interface IDidDocumentQueries {
  getAt(height: number): IDidDocument;
}

export interface IDidDocumentOperations {
  addKey(height: number, auth: Authentication, expiresAtHeight?: number): void;
}

export type IDidDocumentState = IState<IDidDocumentQueries, IDidDocumentOperations>;
