import { Interfaces as CryptoIf } from '@arkecosystem/crypto';

export type Principal = string;
export type BlockHeight = bigint;

export interface ICoeusData extends CryptoIf.ITransactionData {
  asset: ICoeusAsset;
}

export interface IUserOperation {
  type: "register"|"update"|"renew"|"transfer"|"delete";
  name: string;
}

export interface ISubtreePolicies {
  expiration?: { maxExpiry: bigint };
  schema?: { schema: unknown };
}

export interface IRegisterOperation extends IUserOperation {
  type: "register";
  owner: Principal;
  subtreePolicies: ISubtreePolicies;
  registrationPolicy: "owner" | "any";
  data: unknown;
  expiresAtHeight: BlockHeight;
}

export interface IUpdateOperation extends IUserOperation {
  type: "update";
  data: unknown;
}

export interface IRenewOperation extends IUserOperation {
  type: "renew";
  expiresAtHeight: BlockHeight;
}

export interface ITransferOperation extends IUserOperation {
  type: "transfer";
  toOwner: Principal;
}

export interface IDeleteOperation extends IUserOperation {
  type: "delete";
}

export interface ISignedOperations {
  operations: IUserOperation[];
  nonce: bigint;
  publicKey: string;
  signature: string;
}

export interface ICoeusAsset {
  operationAttempts: ISignedOperations[];
}
