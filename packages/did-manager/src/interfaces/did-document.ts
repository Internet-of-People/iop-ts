import { Types } from '@internet-of-people/sdk';

export interface IDidDocumentQueries {
  getAt(height: number): Types.Layer2.IDidDocument;
}

export interface IDidDocumentOperations {
  addKey(height: number, auth: Types.Crypto.Authentication, expiresAtHeight?: number): void;
  revokeKey(height: number, auth: Types.Crypto.Authentication): void;
  addRight(height: number, auth: Types.Crypto.Authentication, right: Types.Sdk.Right): void;
  revokeRight(height: number, auth: Types.Crypto.Authentication, right: Types.Sdk.Right): void;
  tombstone(height: number): void;
}

export type IDidDocumentState = Types.Layer2.IState<IDidDocumentQueries, IDidDocumentOperations>;
