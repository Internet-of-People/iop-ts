/* tslint:disable */
/* eslint-disable */
/**
* @param {any} data 
* @param {string} keep_properties_list 
* @returns {string} 
*/
export function mask(data: any, keep_properties_list: string): string;
/**
* @param {any} data 
* @returns {string} 
*/
export function digest(data: any): string;
/**
*/
export class Bip32 {
  free(): void;
}
/**
*/
export class Bip32Node {
  free(): void;
}
/**
*/
export class Bip39 {
  free(): void;
/**
* @param {string} lang_code 
*/
  constructor(lang_code: string);
/**
* @param {Uint8Array} entropy 
* @returns {Bip39Phrase} 
*/
  entropy(entropy: Uint8Array): Bip39Phrase;
/**
* @param {string} phrase 
*/
  validatePhrase(phrase: string): void;
/**
* @param {string} prefix 
* @returns {any[]} 
*/
  listWords(prefix: string): any[];
/**
* @param {string} phrase 
* @returns {Bip39Phrase} 
*/
  phrase(phrase: string): Bip39Phrase;
}
/**
*/
export class Bip39Phrase {
  free(): void;
/**
* @param {string} password 
* @returns {Seed} 
*/
  password(password: string): Seed;
/**
* @returns {string} 
*/
  readonly phrase: string;
}
/**
*/
export class Bip44 {
  free(): void;
/**
* @param {Seed} seed 
* @param {string} name 
* @returns {Bip44Coin} 
*/
  static network(seed: Seed, name: string): Bip44Coin;
}
/**
*/
export class Bip44Account {
  free(): void;
/**
* @param {boolean} change 
* @returns {Bip44SubAccount} 
*/
  chain(change: boolean): Bip44SubAccount;
/**
* @param {number} idx 
* @returns {Bip44Key} 
*/
  key(idx: number): Bip44Key;
/**
* @returns {string} 
*/
  xprv(): string;
/**
* @returns {string} 
*/
  xpub(): string;
/**
* @returns {Bip32Node} 
*/
  readonly node: Bip32Node;
/**
* @returns {string} 
*/
  readonly path: string;
}
/**
*/
export class Bip44Coin {
  free(): void;
/**
* @param {number} account 
* @returns {Bip44Account} 
*/
  account(account: number): Bip44Account;
/**
* @returns {string} 
*/
  xprv(): string;
/**
* @returns {Bip32Node} 
*/
  readonly node: Bip32Node;
/**
* @returns {string} 
*/
  readonly path: string;
}
/**
*/
export class Bip44Key {
  free(): void;
/**
* @returns {SecpPrivateKey} 
*/
  privateKey(): SecpPrivateKey;
/**
* @returns {SecpPublicKey} 
*/
  publicKey(): SecpPublicKey;
/**
* @returns {SecpKeyId} 
*/
  keyId(): SecpKeyId;
/**
* @returns {string} 
*/
  wif(): string;
/**
* @returns {string} 
*/
  readonly address: string;
/**
* @returns {Bip32Node} 
*/
  readonly node: Bip32Node;
/**
* @returns {string} 
*/
  readonly path: string;
}
/**
*/
export class Bip44SubAccount {
  free(): void;
/**
* @param {number} idx 
* @returns {Bip44Key} 
*/
  key(idx: number): Bip44Key;
/**
* @returns {string} 
*/
  xprv(): string;
/**
* @returns {string} 
*/
  xpub(): string;
/**
* @returns {Bip32Node} 
*/
  readonly node: Bip32Node;
/**
* @returns {string} 
*/
  readonly path: string;
}
/**
*/
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
export class JsBip32 {
  free(): void;
/**
* @param {Seed} seed 
* @param {string} name 
* @returns {Bip32Node} 
*/
  static master(seed: Seed, name: string): Bip32Node;
}
export class JsBip32Node {
  free(): void;
/**
* @param {number} idx 
* @returns {Bip32Node} 
*/
  deriveNormal(idx: number): Bip32Node;
/**
* @param {number} idx 
* @returns {Bip32Node} 
*/
  deriveHardened(idx: number): Bip32Node;
/**
* @returns {string} 
*/
  xprv(): string;
/**
* @returns {string} 
*/
  xpub(): string;
/**
* @returns {string} 
*/
  wif(): string;
/**
* @returns {string} 
*/
  p2pkh(): string;
/**
* @returns {SecpKeyId} 
*/
  readonly keyId: SecpKeyId;
/**
* @returns {string} 
*/
  readonly path: string;
/**
* @returns {SecpPrivateKey} 
*/
  readonly privateKey: SecpPrivateKey;
/**
* @returns {SecpPublicKey} 
*/
  readonly publicKey: SecpPublicKey;
}
/**
*/
export class KeyId {
  free(): void;
/**
* @param {string} key_id_str 
*/
  constructor(key_id_str: string);
/**
* @param {SecpKeyId} secp 
* @returns {KeyId} 
*/
  static fromSecp(secp: SecpKeyId): KeyId;
/**
* @returns {string} 
*/
  static prefix(): string;
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
export class PrivateKey {
  free(): void;
/**
* @param {SecpPrivateKey} sk 
* @returns {PrivateKey} 
*/
  static fromSecp(sk: SecpPrivateKey): PrivateKey;
/**
* @returns {PublicKey} 
*/
  publicKey(): PublicKey;
/**
* @param {Uint8Array} data 
* @returns {Signature} 
*/
  validateEcdsa(data: Uint8Array): Signature;
}
/**
*/
export class PublicKey {
  free(): void;
/**
* @param {string} pub_key_str 
*/
  constructor(pub_key_str: string);
/**
* @param {SecpPublicKey} pk 
* @returns {PublicKey} 
*/
  static fromSecp(pk: SecpPublicKey): PublicKey;
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
* @param {Uint8Array} data 
* @param {Signature} signature 
* @returns {boolean} 
*/
  validateEcdsa(data: Uint8Array, signature: Signature): boolean;
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
export class SecpKeyId {
  free(): void;
}
/**
*/
export class SecpPrivateKey {
  free(): void;
/**
* @param {string} phrase 
* @returns {SecpPrivateKey} 
*/
  static fromArkPassphrase(phrase: string): SecpPrivateKey;
/**
* @param {string} network 
* @returns {string} 
*/
  toWif(network: string): string;
/**
* @returns {SecpPublicKey} 
*/
  publicKey(): SecpPublicKey;
/**
* @param {Uint8Array} data 
* @returns {SecpSignature} 
*/
  validateEcdsa(data: Uint8Array): SecpSignature;
}
/**
*/
export class SecpPublicKey {
  free(): void;
/**
* @returns {SecpKeyId} 
*/
  keyId(): SecpKeyId;
/**
* @param {SecpKeyId} key_id 
* @returns {boolean} 
*/
  validateId(key_id: SecpKeyId): boolean;
/**
* @param {Uint8Array} data 
* @param {SecpSignature} signature 
* @returns {boolean} 
*/
  validateEcdsa(data: Uint8Array, signature: SecpSignature): boolean;
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
export class SecpSignature {
  free(): void;
/**
* @param {Uint8Array} bytes 
* @returns {SecpSignature} 
*/
  static fromDer(bytes: Uint8Array): SecpSignature;
/**
* @returns {Uint8Array} 
*/
  toDer(): Uint8Array;
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
export class Seed {
  free(): void;
}
/**
*/
export class Signature {
  free(): void;
/**
* @param {string} sign_str 
*/
  constructor(sign_str: string);
/**
* @param {SecpSignature} secp 
* @returns {Signature} 
*/
  static fromSecp(secp: SecpSignature): Signature;
/**
* @returns {string} 
*/
  static prefix(): string;
/**
* @returns {string} 
*/
  toString(): string;
}
/**
*/
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
/**
* @returns {Uint8Array} 
*/
  readonly content: Uint8Array;
/**
* @returns {PublicKey} 
*/
  readonly publicKey: PublicKey;
/**
* @returns {Signature} 
*/
  readonly signature: Signature;
}
/**
*/
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
/**
* @returns {any} 
*/
  readonly content: any;
/**
* @returns {PublicKey} 
*/
  readonly publicKey: PublicKey;
/**
* @returns {Signature} 
*/
  readonly signature: Signature;
}
/**
*/
export class ValidationIssue {
  free(): void;
/**
* @returns {number} 
*/
  readonly code: number;
/**
* @returns {string} 
*/
  readonly reason: string;
/**
* @returns {string} 
*/
  readonly severity: string;
}
/**
*/
export class ValidationResult {
  free(): void;
/**
* @returns {any[]} 
*/
  readonly messages: any[];
/**
* @returns {string} 
*/
  readonly status: string;
}
/**
*/
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
