import cloneDeep from "lodash.clonedeep";
import {
  Authentication,
  Did,
  IDidDocument,
  IDidDocumentOperations,
  IDidDocumentQueries,
  IDidDocumentState
} from "../../../interfaces";
import {DidDocument} from "./document";

export const MORPHEUS_DID_PREFIX = "did:morpheus:";
export const MULTICIPHER_KEYID_PREFIX = "i";

// TODO these might needed to be moved somewhere else
export enum AuthenticationKind {
  PublicKey = "PublicKey",
  KeyId = "KeyId",
}

export enum CipherSuite {
  Ed25519Key = "Ed25519",
  Secp256k1Key = "Secp256k1",
}

interface IAuthenticationEntry {
  // TODO probably should be
  // kind: AuthenticationKind;
  // cipherSuite: CipherSuite,
  auth: Authentication;
  validFromHeight?: number;
  validUntilHeight?: number;
}

export const didToAuth = (did: Did): Authentication => {
  return did.replace(new RegExp(`^${MORPHEUS_DID_PREFIX}`), MULTICIPHER_KEYID_PREFIX);
};

export class DidDocumentState implements IDidDocumentState {

  public readonly query: IDidDocumentQueries = {
    getAt: (height?: number): IDidDocument => {
      return new DidDocument({});
    }
  };

  public readonly apply: IDidDocumentOperations = {
    addKey: (auth: Authentication, height: number): void => {
      // TODO check if there is already an existing and valid entry with this auth key/id
      this.keys.push( {auth, validFromHeight: height});
    }
  };

  public readonly revert: IDidDocumentOperations = {
    addKey: (auth: Authentication, height: number): void => {
      // TODO check if the last key/id in the auth array is the same as the one being reverted and is valid
      this.keys.pop();
    }
  };
  private keys: IAuthenticationEntry[] = [];

  public constructor(public readonly did: Did) {
    this.keys.push( {auth: didToAuth(did)} );
  }

  public clone(): IDidDocumentState {
    const result = new DidDocumentState(this.did);
    result.keys = cloneDeep(this.keys);
    return result;
  }
}