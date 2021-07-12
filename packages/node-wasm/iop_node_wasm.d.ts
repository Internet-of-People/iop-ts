/* tslint:disable */
/* eslint-disable */
/**
* @param {any} data
* @param {string} keep_properties_list
* @returns {string}
*/
export function selectiveDigestJson(data: any, keep_properties_list: string): string;
/**
* @param {any} data
* @returns {string}
*/
export function digestJson(data: any): string;
/**
* @param {any} data
* @returns {string}
*/
export function stringifyJson(data: any): string;
/**
* @param {string} name
* @returns {boolean}
*/
export function validateNetworkName(name: string): boolean;
/**
* @param {Uint8Array} plain_text
* @param {string} password
* @returns {Uint8Array}
*/
export function encrypt(plain_text: Uint8Array, password: string): Uint8Array;
/**
* @param {Uint8Array} cipher_text
* @param {string} password
* @returns {Uint8Array}
*/
export function decrypt(cipher_text: Uint8Array, password: string): Uint8Array;
/**
*/
export class Bip32 {
  free(): void;
/**
* @param {Seed} seed
* @param {string} name
* @returns {Bip32Node}
*/
  static master(seed: Seed, name: string): Bip32Node;
}
/**
*/
export class Bip32Node {
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
* @returns {SecpPrivateKey}
*/
  privateKey(): SecpPrivateKey;
/**
* @returns {Bip32PublicNode}
*/
  neuter(): Bip32PublicNode;
/**
* @param {string} name
* @returns {string}
*/
  toXprv(name: string): string;
/**
* @param {string} name
* @returns {string}
*/
  toWif(name: string): string;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
}
/**
*/
export class Bip32PublicNode {
  free(): void;
/**
* @param {number} idx
* @returns {Bip32PublicNode}
*/
  deriveNormal(idx: number): Bip32PublicNode;
/**
* @returns {SecpPublicKey}
*/
  publicKey(): SecpPublicKey;
/**
* @returns {SecpKeyId}
*/
  keyId(): SecpKeyId;
/**
* @param {string} name
* @returns {string}
*/
  toXpub(name: string): string;
/**
* @param {string} name
* @returns {string}
*/
  toP2pkh(name: string): string;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
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
* @returns {Bip39Phrase}
*/
  generate(): Bip39Phrase;
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
* @returns {Bip32Node}
*/
  node(): Bip32Node;
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
* @returns {Bip44PublicAccount}
*/
  neuter(): Bip44PublicAccount;
/**
* @param {number} account
* @param {string} xprv
* @param {string} network
* @returns {Bip44Account}
*/
  static fromXprv(account: number, xprv: string, network: string): Bip44Account;
/**
* @returns {number}
*/
  readonly account: number;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
/**
* @returns {string}
*/
  readonly xprv: string;
}
/**
*/
export class Bip44Coin {
  free(): void;
/**
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* @param {number} account
* @returns {Bip44Account}
*/
  account(account: number): Bip44Account;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
/**
* @returns {string}
*/
  readonly xprv: string;
}
/**
*/
export class Bip44Key {
  free(): void;
/**
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* @returns {SecpPrivateKey}
*/
  privateKey(): SecpPrivateKey;
/**
* @returns {Bip44PublicKey}
*/
  neuter(): Bip44PublicKey;
/**
* @returns {number}
*/
  readonly account: number;
/**
* @returns {boolean}
*/
  readonly change: boolean;
/**
* @returns {number}
*/
  readonly key: number;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
/**
* @returns {string}
*/
  readonly wif: string;
}
/**
*/
export class Bip44PublicAccount {
  free(): void;
/**
* @returns {Bip32PublicNode}
*/
  node(): Bip32PublicNode;
/**
* @param {boolean} change
* @returns {Bip44PublicSubAccount}
*/
  chain(change: boolean): Bip44PublicSubAccount;
/**
* @param {number} idx
* @returns {Bip44PublicKey}
*/
  key(idx: number): Bip44PublicKey;
/**
* @param {number} account
* @param {string} xpub
* @param {string} network
* @returns {Bip44PublicAccount}
*/
  static fromXpub(account: number, xpub: string, network: string): Bip44PublicAccount;
/**
* @returns {number}
*/
  readonly account: number;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
/**
* @returns {string}
*/
  readonly xpub: string;
}
/**
*/
export class Bip44PublicKey {
  free(): void;
/**
* @returns {Bip32PublicNode}
*/
  node(): Bip32PublicNode;
/**
* @returns {SecpPublicKey}
*/
  publicKey(): SecpPublicKey;
/**
* @returns {SecpKeyId}
*/
  keyId(): SecpKeyId;
/**
* @returns {number}
*/
  readonly account: number;
/**
* @returns {string}
*/
  readonly address: string;
/**
* @returns {boolean}
*/
  readonly change: boolean;
/**
* @returns {number}
*/
  readonly key: number;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
}
/**
*/
export class Bip44PublicSubAccount {
  free(): void;
/**
* @returns {Bip32PublicNode}
*/
  node(): Bip32PublicNode;
/**
* @param {number} idx
* @returns {Bip44PublicKey}
*/
  key(idx: number): Bip44PublicKey;
/**
* @param {number} account
* @param {boolean} change
* @param {string} xpub
* @param {string} network
* @returns {Bip44PublicSubAccount}
*/
  static fromXpub(account: number, change: boolean, xpub: string, network: string): Bip44PublicSubAccount;
/**
* @returns {number}
*/
  readonly account: number;
/**
* @returns {boolean}
*/
  readonly change: boolean;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
/**
* @returns {string}
*/
  readonly xpub: string;
}
/**
*/
export class Bip44SubAccount {
  free(): void;
/**
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* @param {number} idx
* @returns {Bip44Key}
*/
  key(idx: number): Bip44Key;
/**
* @returns {Bip44PublicSubAccount}
*/
  neuter(): Bip44PublicSubAccount;
/**
* @param {number} account
* @param {boolean} change
* @param {string} xprv
* @param {string} network
* @returns {Bip44SubAccount}
*/
  static fromXprv(account: number, change: boolean, xprv: string, network: string): Bip44SubAccount;
/**
* @returns {number}
*/
  readonly account: number;
/**
* @returns {boolean}
*/
  readonly change: boolean;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {string}
*/
  readonly path: string;
/**
* @returns {number}
*/
  readonly slip44: number;
/**
* @returns {string}
*/
  readonly xprv: string;
}
/**
*/
export class CoeusAsset {
  free(): void;
/**
* @param {any} data
*/
  constructor(data: any);
/**
* @param {Uint8Array} bytes
* @returns {CoeusAsset}
*/
  static deserialize(bytes: Uint8Array): CoeusAsset;
/**
* @returns {Uint8Array}
*/
  serialize(): Uint8Array;
/**
* @returns {BigInt}
*/
  fee(): BigInt;
/**
* @returns {any}
*/
  toJson(): any;
}
/**
*/
export class CoeusState {
  free(): void;
/**
*/
  constructor();
/**
* @param {DomainName} name
* @returns {any}
*/
  resolveData(name: DomainName): any;
/**
* @param {DomainName} name
* @returns {any}
*/
  getMetadata(name: DomainName): any;
/**
* @param {DomainName} name
* @returns {any}
*/
  getChildren(name: DomainName): any;
/**
* @param {PublicKey} pk
* @returns {BigInt}
*/
  lastNonce(pk: PublicKey): BigInt;
/**
* @param {string} txid
* @param {CoeusAsset} asset
*/
  applyTransaction(txid: string, asset: CoeusAsset): void;
/**
* @param {string} txid
* @param {CoeusAsset} asset
*/
  revertTransaction(txid: string, asset: CoeusAsset): void;
/**
* @param {number} height
*/
  blockApplying(height: number): void;
/**
* @param {number} height
*/
  blockReverted(height: number): void;
/**
* @param {string} txid
* @returns {boolean}
*/
  getTxnStatus(txid: string): boolean;
/**
* @returns {boolean}
*/
  readonly corrupted: boolean;
/**
* @returns {number}
*/
  readonly lastSeenHeight: number;
/**
* @returns {BigInt}
*/
  readonly version: BigInt;
}
/**
*/
export class CoeusTxBuilder {
  free(): void;
/**
* @param {string} network_name
*/
  constructor(network_name: string);
/**
* @param {SignedBundle} ops
* @param {SecpPublicKey} sender_pubkey
* @param {BigInt} nonce
* @returns {any}
*/
  build(ops: SignedBundle, sender_pubkey: SecpPublicKey, nonce: BigInt): any;
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
/**
*/
export class DidDocument {
  free(): void;
}
/**
*/
export class DomainName {
  free(): void;
/**
* @param {string} domain_name
*/
  constructor(domain_name: string);
/**
* @returns {string}
*/
  toString(): string;
}
/**
*/
export class JwtBuilder {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} content_id
* @returns {JwtBuilder}
*/
  static withContentId(content_id: string): JwtBuilder;
/**
* @param {PrivateKey} sk
* @returns {string}
*/
  sign(sk: PrivateKey): string;
}
/**
*/
export class JwtParser {
  free(): void;
/**
* @param {string} token
*/
  constructor(token: string);
/**
* @returns {BigInt}
*/
  readonly createdAt: BigInt;
/**
* @returns {PublicKey}
*/
  readonly publicKey: PublicKey;
/**
* @returns {BigInt}
*/
  readonly timeToLive: BigInt;
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
export class Morpheus {
  free(): void;
/**
* @param {Seed} seed
* @returns {MorpheusRoot}
*/
  static root(seed: Seed): MorpheusRoot;
}
/**
*/
export class MorpheusKind {
  free(): void;
/**
* @param {number} idx
* @returns {MorpheusPrivateKey}
*/
  key(idx: number): MorpheusPrivateKey;
/**
* @returns {string}
*/
  readonly kind: string;
/**
* @returns {string}
*/
  readonly path: string;
}
/**
*/
export class MorpheusPrivateKey {
  free(): void;
/**
* @returns {MorpheusPublicKey}
*/
  neuter(): MorpheusPublicKey;
/**
* @returns {PrivateKey}
*/
  privateKey(): PrivateKey;
/**
* @returns {number}
*/
  readonly idx: number;
/**
* @returns {string}
*/
  readonly kind: string;
/**
* @returns {string}
*/
  readonly path: string;
}
/**
*/
export class MorpheusPublicKey {
  free(): void;
/**
* @returns {PublicKey}
*/
  publicKey(): PublicKey;
/**
* @returns {number}
*/
  readonly idx: number;
/**
* @returns {string}
*/
  readonly kind: string;
/**
* @returns {string}
*/
  readonly path: string;
}
/**
*/
export class MorpheusRoot {
  free(): void;
/**
* @returns {MorpheusKind}
*/
  personas(): MorpheusKind;
/**
* @returns {string}
*/
  readonly path: string;
}
/**
*/
export class MorpheusState {
  free(): void;
/**
*/
  constructor();
/**
* @returns {number}
*/
  lastBlockHeight(): number;
/**
* @param {string} txid
* @returns {boolean | undefined}
*/
  isConfirmed(txid: string): boolean | undefined;
/**
* @param {string} content_id
* @param {number | undefined} height_opt
* @returns {boolean}
*/
  beforeProofExistsAt(content_id: string, height_opt?: number): boolean;
/**
* @param {string} content_id
* @returns {any}
*/
  beforeProofHistory(content_id: string): any;
/**
* @param {string} did
* @param {boolean} include_attempts
* @param {number} from_height_inc
* @param {number | undefined} until_height_inc
* @returns {any}
*/
  getTransactionHistory(did: string, include_attempts: boolean, from_height_inc: number, until_height_inc?: number): any;
/**
* @param {string} did
* @returns {string | undefined}
*/
  lastTxId(did: string): string | undefined;
/**
* @param {string} did_data
* @param {number | undefined} height_opt
* @returns {any}
*/
  getDidDocumentAt(did_data: string, height_opt?: number): any;
/**
* @param {any} asset
* @returns {any[]}
*/
  dryRun(asset: any): any[];
/**
* @param {number} height
*/
  blockApplying(height: number): void;
/**
* @param {string} txid
* @param {any} asset
*/
  applyTransaction(txid: string, asset: any): void;
/**
* @param {number} height
*/
  blockReverting(height: number): void;
/**
* @param {string} txid
* @param {any} asset
*/
  revertTransaction(txid: string, asset: any): void;
/**
* @returns {boolean}
*/
  readonly corrupted: boolean;
}
/**
*/
export class NoncedBundle {
  free(): void;
/**
* @returns {Price}
*/
  price(): Price;
/**
* @param {PrivateKey} sk
* @returns {SignedBundle}
*/
  sign(sk: PrivateKey): SignedBundle;
/**
* @returns {string}
*/
  serialize(): string;
}
/**
*/
export class NoncedBundleBuilder {
  free(): void;
/**
*/
  constructor();
/**
* @param {UserOperation} user_operation
*/
  add(user_operation: UserOperation): void;
/**
* @param {BigInt} nonce
* @returns {NoncedBundle}
*/
  build(nonce: BigInt): NoncedBundle;
}
/**
*/
export class Price {
  free(): void;
/**
* @returns {BigInt}
*/
  readonly fee: BigInt;
}
/**
*/
export class Principal {
  free(): void;
/**
* @returns {Principal}
*/
  static system(): Principal;
/**
* @param {PublicKey} pk
* @returns {Principal}
*/
  static publicKey(pk: PublicKey): Principal;
/**
* @param {PublicKey} pk
*/
  validateImpersonation(pk: PublicKey): void;
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
  signEcdsa(data: Uint8Array): Signature;
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
/**
* @param {string} address
* @param {string} network
* @returns {SecpKeyId}
*/
  static fromAddress(address: string, network: string): SecpKeyId;
/**
* @param {string} network
* @returns {string}
*/
  toAddress(network: string): string;
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
* @param {string} wif
* @param {string} network
* @returns {SecpPrivateKey}
*/
  static fromWif(wif: string, network: string): SecpPrivateKey;
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
  signEcdsa(data: Uint8Array): SecpSignature;
}
/**
*/
export class SecpPublicKey {
  free(): void;
/**
* @param {string} key
*/
  constructor(key: string);
/**
* @returns {SecpKeyId}
*/
  keyId(): SecpKeyId;
/**
* @returns {SecpKeyId}
*/
  arkKeyId(): SecpKeyId;
/**
* @param {SecpKeyId} key_id
* @returns {boolean}
*/
  validateId(key_id: SecpKeyId): boolean;
/**
* @param {SecpKeyId} key_id
* @returns {boolean}
*/
  validateArkId(key_id: SecpKeyId): boolean;
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
/**
* @param {Uint8Array} bytes
*/
  constructor(bytes: Uint8Array);
/**
* @returns {string}
*/
  static demoPhrase(): string;
/**
* @returns {string}
*/
  static legacyPassword(): string;
/**
* @returns {Uint8Array}
*/
  toBytes(): Uint8Array;
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
export class SignedBundle {
  free(): void;
/**
* @param {any} data
*/
  constructor(data: any);
/**
* @returns {Price}
*/
  price(): Price;
/**
* @returns {boolean}
*/
  verify(): boolean;
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
export class SubtreePolicies {
  free(): void;
/**
*/
  constructor();
/**
* @param {any} schema
* @returns {SubtreePolicies}
*/
  withSchema(schema: any): SubtreePolicies;
/**
* @param {number} max_block_count
* @returns {SubtreePolicies}
*/
  withExpiration(max_block_count: number): SubtreePolicies;
}
/**
*/
export class UserOperation {
  free(): void;
/**
* @param {DomainName} name
* @param {Principal} owner
* @param {SubtreePolicies} subtree_policies
* @param {any} data
* @param {number} expires_at_height
* @returns {UserOperation}
*/
  static register(name: DomainName, owner: Principal, subtree_policies: SubtreePolicies, data: any, expires_at_height: number): UserOperation;
/**
* @param {DomainName} name
* @param {any} data
* @returns {UserOperation}
*/
  static update(name: DomainName, data: any): UserOperation;
/**
* @param {DomainName} name
* @param {number} expires_at_height
* @returns {UserOperation}
*/
  static renew(name: DomainName, expires_at_height: number): UserOperation;
/**
* @param {DomainName} name
* @param {Principal} to_owner
* @returns {UserOperation}
*/
  static transfer(name: DomainName, to_owner: Principal): UserOperation;
/**
* @param {DomainName} name
* @returns {UserOperation}
*/
  static delete(name: DomainName): UserOperation;
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
