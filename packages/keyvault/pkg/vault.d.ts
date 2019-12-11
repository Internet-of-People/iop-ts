/* tslint:disable */
/**
*/
export class KeyId {
  free(): void;
/**
* @param {string} key_id_str 
* @returns {KeyId} 
*/
  constructor(key_id_str: string);
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
export class PublicKey {
  free(): void;
/**
* @param {string} pub_key_str 
* @returns {PublicKey} 
*/
  constructor(pub_key_str: string);
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
/**
*/
export class Signature {
  free(): void;
/**
* @param {string} sign_str 
* @returns {Signature} 
*/
  constructor(sign_str: string);
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
export class SignedMessage {
  free(): void;
/**
* @param {PublicKey} public_key 
* @param {Uint8Array} message 
* @param {Signature} signature 
* @returns {SignedMessage} 
*/
  constructor(public_key: PublicKey, message: Uint8Array, signature: Signature);
/**
* @param {KeyId | undefined} signer_id_opt 
* @returns {boolean} 
*/
  validate(signer_id_opt?: KeyId): boolean;
  readonly message: Uint8Array;
  readonly publicKey: PublicKey;
  readonly signature: Signature;
}
/**
*/
export class Vault {
  free(): void;
/**
* @param {string} seed_phrase 
* @returns {Vault} 
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
* @returns {KeyId} 
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
