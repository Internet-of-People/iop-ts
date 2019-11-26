/* tslint:disable */
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
* @returns {any} 
*/
  active_id(): any;
/**
* @returns {string} 
*/
  create_id(): string;
/**
* @param {string} id_str 
* @param {Uint8Array} message 
* @returns {any} 
*/
  sign(id_str: string, message: Uint8Array): any;
}
