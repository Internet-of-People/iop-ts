/* tslint:disable */
/* eslint-disable */
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
* @param {string} name
* @returns {boolean}
*/
export function validateNetworkName(name: string): boolean;
/**
* @param {any} operations
* @param {PrivateKey} private_key
* @returns {any}
*/
export function signMorpheusOperations(operations: any, private_key: PrivateKey): any;
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
export class DomainName {
  free(): void;
/**
* @param {string} domain_name
*/
  constructor(domain_name: string);
}
/**
*/
export class HydraParameters {
  free(): void;
/**
* @param {string} network
* @param {number} account
*/
  constructor(network: string, account: number);
}
/**
*/
export class HydraPlugin {
  free(): void;
/**
* @param {Vault} vault
* @param {string} unlock_password
* @param {HydraParameters} parameters
*/
  static rewind(vault: Vault, unlock_password: string, parameters: HydraParameters): void;
/**
* @param {Vault} vault
* @param {HydraParameters} parameters
* @returns {HydraPlugin}
*/
  static get(vault: Vault, parameters: HydraParameters): HydraPlugin;
/**
* @param {string} unlock_password
* @returns {HydraPrivate}
*/
  priv(unlock_password: string): HydraPrivate;
/**
* @returns {HydraPublic}
*/
  readonly pub: HydraPublic;
}
/**
*/
export class HydraPrivate {
  free(): void;
/**
* @param {number} idx
* @returns {Bip44Key}
*/
  key(idx: number): Bip44Key;
/**
* @param {SecpPublicKey} id
* @returns {Bip44Key}
*/
  keyByPublicKey(id: SecpPublicKey): Bip44Key;
/**
* @param {string} hyd_addr
* @param {any} tx
* @returns {any}
*/
  signHydraTransaction(hyd_addr: string, tx: any): any;
/**
* @returns {number}
*/
  readonly changeKeys: number;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {HydraPublic}
*/
  readonly pub: HydraPublic;
/**
* @returns {number}
*/
  readonly receiveKeys: number;
/**
* @returns {string}
*/
  readonly xprv: string;
/**
* @returns {string}
*/
  readonly xpub: string;
}
/**
*/
export class HydraPublic {
  free(): void;
/**
* @param {number} idx
* @returns {Bip44PublicKey}
*/
  key(idx: number): Bip44PublicKey;
/**
* @param {string} addr
* @returns {Bip44PublicKey}
*/
  keyByAddress(addr: string): Bip44PublicKey;
/**
* @returns {number}
*/
  readonly changeKeys: number;
/**
* @returns {string}
*/
  readonly network: string;
/**
* @returns {number}
*/
  readonly receiveKeys: number;
/**
* @returns {string}
*/
  readonly xpub: string;
}
/**
*/
export class HydraSigner {
  free(): void;
/**
* @param {SecpPrivateKey} inner
*/
  constructor(inner: SecpPrivateKey);
/**
* @param {any} transaction
* @returns {any}
*/
  signHydraTransaction(transaction: any): any;
}
/**
*/
export class HydraTxBuilder {
  free(): void;
/**
* @param {string} network_name
*/
  constructor(network_name: string);
/**
* @param {SecpKeyId} recipient_id
* @param {SecpPublicKey} sender_pubkey
* @param {BigInt} amount_flake
* @param {BigInt} nonce
* @returns {any}
*/
  transfer(recipient_id: SecpKeyId, sender_pubkey: SecpPublicKey, amount_flake: BigInt, nonce: BigInt): any;
/**
* @param {SecpPublicKey} delegate
* @param {SecpPublicKey} sender_pubkey
* @param {BigInt} nonce
* @returns {any}
*/
  vote(delegate: SecpPublicKey, sender_pubkey: SecpPublicKey, nonce: BigInt): any;
/**
* @param {SecpPublicKey} delegate
* @param {SecpPublicKey} sender_pubkey
* @param {BigInt} nonce
* @returns {any}
*/
  unvote(delegate: SecpPublicKey, sender_pubkey: SecpPublicKey, nonce: BigInt): any;
/**
* @param {SecpPublicKey} sender_pubkey
* @param {string} delegate_name
* @param {BigInt} nonce
* @returns {any}
*/
  registerDelegate(sender_pubkey: SecpPublicKey, delegate_name: string, nonce: BigInt): any;
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
export class MorpheusOperationBuilder {
  free(): void;
/**
* @param {string} did
* @param {any} last_tx_id
*/
  constructor(did: string, last_tx_id: any);
/**
* @param {string} authentication
* @param {any} expires_at_height
* @returns {any}
*/
  addKey(authentication: string, expires_at_height: any): any;
/**
* @param {string} authentication
* @returns {any}
*/
  revokeKey(authentication: string): any;
/**
* @param {string} authentication
* @param {string} right
* @returns {any}
*/
  addRight(authentication: string, right: string): any;
/**
* @param {string} authentication
* @param {string} right
* @returns {any}
*/
  revokeRight(authentication: string, right: string): any;
/**
* @returns {any}
*/
  tombstoneDid(): any;
}
/**
*/
export class MorpheusPlugin {
  free(): void;
/**
* @param {Vault} vault
* @param {string} unlock_password
*/
  static rewind(vault: Vault, unlock_password: string): void;
/**
* @param {Vault} vault
* @returns {MorpheusPlugin}
*/
  static get(vault: Vault): MorpheusPlugin;
/**
* @param {string} unlock_password
* @returns {MorpheusPrivate}
*/
  priv(unlock_password: string): MorpheusPrivate;
/**
* @returns {MorpheusPublic}
*/
  readonly pub: MorpheusPublic;
}
/**
*/
export class MorpheusPrivate {
  free(): void;
/**
* @param {PublicKey} pk
* @returns {MorpheusPrivateKey}
*/
  keyByPublicKey(pk: PublicKey): MorpheusPrivateKey;
/**
* @param {KeyId} id
* @returns {MorpheusPrivateKey}
*/
  keyById(id: KeyId): MorpheusPrivateKey;
/**
* @param {KeyId} id
* @param {Uint8Array} message
* @returns {SignedBytes}
*/
  signDidOperations(id: KeyId, message: Uint8Array): SignedBytes;
/**
* @param {KeyId} id
* @param {any} js_req
* @returns {SignedJson}
*/
  signWitnessRequest(id: KeyId, js_req: any): SignedJson;
/**
* @param {KeyId} id
* @param {any} js_stmt
* @returns {SignedJson}
*/
  signWitnessStatement(id: KeyId, js_stmt: any): SignedJson;
/**
* @param {KeyId} id
* @param {any} js_presentation
* @returns {SignedJson}
*/
  signClaimPresentation(id: KeyId, js_presentation: any): SignedJson;
/**
* @returns {MorpheusPrivateKind}
*/
  readonly personas: MorpheusPrivateKind;
/**
* @returns {MorpheusPublic}
*/
  readonly pub: MorpheusPublic;
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
export class MorpheusPrivateKind {
  free(): void;
/**
* @param {number} idx
* @returns {MorpheusPrivateKey}
*/
  key(idx: number): MorpheusPrivateKey;
/**
* @param {number} idx
* @returns {Did}
*/
  did(idx: number): Did;
/**
* @param {PublicKey} id
* @returns {MorpheusPrivateKey}
*/
  keyByPublicKey(id: PublicKey): MorpheusPrivateKey;
/**
* @returns {number}
*/
  readonly count: number;
/**
* @returns {string}
*/
  readonly kind: string;
/**
* @returns {MorpheusPublicKind}
*/
  readonly pub: MorpheusPublicKind;
}
/**
*/
export class MorpheusPublic {
  free(): void;
/**
* @param {KeyId} id
* @returns {PublicKey}
*/
  keyById(id: KeyId): PublicKey;
/**
* @returns {MorpheusPublicKind}
*/
  readonly personas: MorpheusPublicKind;
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
export class MorpheusPublicKind {
  free(): void;
/**
* @param {number} idx
* @returns {PublicKey}
*/
  key(idx: number): PublicKey;
/**
* @param {number} idx
* @returns {Did}
*/
  did(idx: number): Did;
/**
* @param {KeyId} id
* @returns {PublicKey}
*/
  keyById(id: KeyId): PublicKey;
/**
* @returns {number}
*/
  readonly count: number;
/**
* @returns {string}
*/
  readonly kind: string;
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
export class MorpheusTxBuilder {
  free(): void;
/**
* @param {string} network_name
* @param {SecpPublicKey} sender_pubkey
* @param {BigInt} nonce
*/
  constructor(network_name: string, sender_pubkey: SecpPublicKey, nonce: BigInt);
/**
* @param {string} content_id
* @returns {MorpheusTxBuilder}
*/
  addRegisterBeforeProof(content_id: string): MorpheusTxBuilder;
/**
* @param {any} signed_operation
* @returns {MorpheusTxBuilder}
*/
  addSigned(signed_operation: any): MorpheusTxBuilder;
/**
* @returns {any}
*/
  build(): any;
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
* @returns {NoncedBundleBuilder}
*/
  add(user_operation: UserOperation): NoncedBundleBuilder;
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
/**
*/
export class Vault {
  free(): void;
/**
* @param {string} phrase
* @param {string} bip39_password
* @param {string} unlock_password
* @param {string | undefined} language
* @returns {Vault}
*/
  static create(phrase: string, bip39_password: string, unlock_password: string, language?: string): Vault;
/**
* @param {any} data
* @returns {Vault}
*/
  static load(data: any): Vault;
/**
* @returns {any}
*/
  save(): any;
/**
*/
  setDirty(): void;
/**
* @param {string} password
* @returns {Seed}
*/
  unlock(password: string): Seed;
/**
* @returns {boolean}
*/
  readonly dirty: boolean;
}
