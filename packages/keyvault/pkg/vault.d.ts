/* tslint:disable */
/**
*/
export class SignedMessage {
  free(): void;
/**
* @param {string} public_key 
* @param {Uint8Array} message 
* @param {string} signature 
* @returns {SignedMessage} 
*/
  constructor(public_key: string, message: Uint8Array, signature: string);
  readonly message: Uint8Array;
  readonly public_key: string;
  readonly signature: string;
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
* @returns {string} 
*/
  active_id(): string | undefined;
/**
* @returns {string} 
*/
  create_id(): string;
/**
* @param {string} id_str 
* @param {Uint8Array} message 
* @returns {SignedMessage} 
*/
  sign(id_str: string, message: Uint8Array): SignedMessage;
/**
* @param {string | undefined} signer_id_str 
* @param {SignedMessage} signed_message 
* @returns {boolean} 
*/
  validate_signature(signer_id_str: string | undefined, signed_message: SignedMessage): boolean;
}
