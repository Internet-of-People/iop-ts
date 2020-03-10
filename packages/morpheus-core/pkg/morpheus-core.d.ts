/* tslint:disable */
/* eslint-disable */
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
export class SignedMessage {
  free(): void;
/**
* @param {PublicKey} public_key 
* @param {Uint8Array} message 
* @param {Signature} signature 
*/
  constructor(public_key: PublicKey, message: Uint8Array, signature: Signature);
/**
* @returns {boolean} 
*/
  validate(): boolean;
/**
* @param {KeyId} signer_id 
* @returns {boolean} 
*/
  validateWithId(signer_id: KeyId): boolean;
  readonly message: Uint8Array;
  readonly publicKey: PublicKey;
  readonly signature: Signature;
}
export class SignedString {
  free(): void;
/**
* @param {PublicKey} public_key 
* @param {string} content 
* @param {Signature} signature 
*/
  constructor(public_key: PublicKey, content: string, signature: Signature);
/**
* @param {SignedMessage} signed 
* @returns {SignedString} 
*/
  static from(signed: SignedMessage): SignedString;
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
* @returns {boolean} 
*/
  validateWithDid(did_doc_str: string, from_height_inc?: number, until_height_exc?: number): boolean;
  readonly content: string;
  readonly publicKey: PublicKey;
  readonly signature: Signature;
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
  profiles(): any[];
/**
* @returns {KeyId | undefined} 
*/
  activeId(): KeyId | undefined;
/**
* @returns {KeyId} 
*/
  createId(): KeyId;
/**
* @param {KeyId} key_id 
* @param {Uint8Array} message 
* @returns {SignedMessage} 
*/
  sign(key_id: KeyId, message: Uint8Array): SignedMessage;
}
