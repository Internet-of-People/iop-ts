/* tslint:disable */
/* eslint-disable */
export class Did {
  free(): void;
/**
* @param {string} did_str 
*/
  constructor(did_str: string);
/**
* @returns {string} 
*/
  static prefix(): string;
/**
* @param {KeyId} key_id 
* @returns {Did} 
*/
  static fromKeyId(key_id: KeyId): Did;
/**
* @returns {KeyId} 
*/
  defaultKeyId(): KeyId;
/**
* @returns {string} 
*/
  toString(): string;
}
export class KeyId {
  free(): void;
/**
* @param {string} key_id_str 
*/
  constructor(key_id_str: string);
/**
* @returns {string} 
*/
  static prefix(): string;
/**
* @returns {string} 
*/
  toString(): string;
}
export class PublicKey {
  free(): void;
/**
* @param {string} pub_key_str 
*/
  constructor(pub_key_str: string);
/**
* @returns {string} 
*/
  static prefix(): string;
/**
* @returns {KeyId} 
*/
  keyId(): KeyId;
/**
* @param {KeyId} key_id 
* @returns {boolean} 
*/
  validateId(key_id: KeyId): boolean;
/**
* @returns {string} 
*/
  toString(): string;
}
export class Signature {
  free(): void;
/**
* @param {string} sign_str 
*/
  constructor(sign_str: string);
/**
* @returns {string} 
*/
  static prefix(): string;
/**
* @returns {string} 
*/
  toString(): string;
}
export class SignedBytes {
  free(): void;
/**
* @param {PublicKey} public_key 
* @param {Uint8Array} content 
* @param {Signature} signature 
*/
  constructor(public_key: PublicKey, content: Uint8Array, signature: Signature);
/**
* @returns {boolean} 
*/
  validate(): boolean;
  readonly content: Uint8Array;
  readonly publicKey: PublicKey;
  readonly signature: Signature;
}
export class SignedJson {
  free(): void;
/**
* @param {PublicKey} public_key 
* @param {any} content 
* @param {Signature} signature 
*/
  constructor(public_key: PublicKey, content: any, signature: Signature);
/**
* @returns {boolean} 
*/
  validate(): boolean;
/**
* @param {KeyId} signer_id 
* @returns {boolean} 
*/
  validateWithKeyId(signer_id: KeyId): boolean;
/**
* @param {string} did_doc_str 
* @param {number | undefined} from_height_inc 
* @param {number | undefined} until_height_exc 
* @returns {any} 
*/
  validateWithDidDoc(did_doc_str: string, from_height_inc?: number, until_height_exc?: number): any;
  readonly content: any;
  readonly publicKey: PublicKey;
  readonly signature: Signature;
}
export class ValidationIssue {
  free(): void;
  readonly code: number;
  readonly reason: string;
  readonly severity: string;
}
export class ValidationResult {
  free(): void;
  readonly messages: any[];
  readonly status: string;
}
export class Vault {
  free(): void;
/**
* @param {string} seed_phrase 
*/
  constructor(seed_phrase: string);
/**
* @returns {string} 
*/
  serialize(): string;
/**
* @param {string} from 
* @returns {Vault} 
*/
  static deserialize(from: string): Vault;
/**
* @returns {any[]} 
*/
  keyIds(): any[];
/**
* @returns {any[]} 
*/
  dids(): any[];
/**
* @returns {Did | undefined} 
*/
  activeDid(): Did | undefined;
/**
* @returns {Did} 
*/
  createDid(): Did;
/**
* @param {KeyId} key_id 
* @param {any} js_req 
* @returns {SignedJson} 
*/
  signWitnessRequest(key_id: KeyId, js_req: any): SignedJson;
/**
* @param {KeyId} key_id 
* @param {any} js_stmt 
* @returns {SignedJson} 
*/
  signWitnessStatement(key_id: KeyId, js_stmt: any): SignedJson;
/**
* @param {KeyId} key_id 
* @param {any} js_presentation 
* @returns {SignedJson} 
*/
  signClaimPresentation(key_id: KeyId, js_presentation: any): SignedJson;
/**
* @param {KeyId} key_id 
* @param {Uint8Array} js_operations 
* @returns {SignedBytes} 
*/
  signDidOperations(key_id: KeyId, js_operations: Uint8Array): SignedBytes;
}
