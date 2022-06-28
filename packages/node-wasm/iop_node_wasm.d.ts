/* tslint:disable */
/* eslint-disable */
/**
* Returns a canonical string representation of a JSON document, in which any sub-objects not explicitly listed in the
* second argument are collapsed to their digest. The format of the second argument is inspired by
* [JQ basic filters](https://stedolan.github.io/jq/manual/#Basicfilters) and these are some examples:
*
* ```json
* {
*     "a": {
*         "1": "apple",
*         "2": "banana"
*     },
*     "b": ["some", "array", 0xf, "values"],
*     "c": 42
* }
* ```
*
* - "" -> Same as calling {@link digestJson}
* - ".a" -> Keep property "a" untouched, the rest will be replaced with their digest. Note that most likely the scalar number "c"
*   does not have enough entropy to avoid a brute-force attack for its digest.
* - ".b, .c" -> Keeps both properties "b" and "c" unaltered, but "a" will be replaced with the digest of that sub-object.
*
* You should protect scalar values and easy-to-guess lists by replacing them with an object that has an extra "nonce" property, which
* has enough entropy. @see wrapJsonWithNonce
* @param {any} data
* @param {string} keep_properties_list
* @returns {string}
*/
export function selectiveDigestJson(data: any, keep_properties_list: string): string;
/**
* Calculates the digest of a JSON document. Since this digest is calculated by recursively replacing sub-objects with their digest,
* it is possible to selectively reveal parts of the document using {@link selectiveDigestJson}
* @param {any} data
* @returns {string}
*/
export function digestJson(data: any): string;
/**
* This function provides a canonical string for any JSON document. Order of the keys in objects, whitespace
* and unicode normalization are all taken care of, so document that belongs to a single digest is not malleable.
*
* This is a drop-in replacement for `JSON.stringify(data)`
* @param {any} data
* @returns {string}
*/
export function stringifyJson(data: any): string;
/**
* You should protect scalar values and easy-to-guess lists by replacing them with an object that has an extra "nonce" property, which
* has enough entropy. List of all countries, cities in a country, streets in a city are all easy to enumerate for a brute-fore
* attack.
*
* For example if you have a string that is a country, you can call this function like `wrapJsonWithNonce("Germany")` and get an
* object like the following:
*
* ```json
* {
*     "nonce": "ukhFsI4a6vIZEDUOBRxJmLroPEQ8FQCjJwbI-Z7bEocGo",
*     "value": "Germany"
* }
* ```
* @param {any} data
* @returns {any}
*/
export function wrapWithNonce(data: any): any;
/**
* Encrypts the plaintext with a password. Make sure the password is not weak.
* A random nonce is generated for each call so each time the same plaintext is
* encrypted with the same password, the result is a different ciphertext. The
* ciphertext returned will be 40 bytes longer than the plaintext.
*
* @see decrypt
* @param {Uint8Array} plain_text
* @param {string} password
* @returns {Uint8Array}
*/
export function encrypt(plain_text: Uint8Array, password: string): Uint8Array;
/**
* Decrypts the ciphertext with a password. The format of the ciphertext is
* defined by the {@link encrypt} function. Only the matching password will decrypt
* the ciphertext.
* @param {Uint8Array} cipher_text
* @param {string} password
* @returns {Uint8Array}
*/
export function decrypt(cipher_text: Uint8Array, password: string): Uint8Array;
/**
* Free function that checks if a string is a valid network name usable as a parameter in some other calls.
*
* @see allNetworkNames
* @param {string} name
* @returns {boolean}
*/
export function validateNetworkName(name: string): boolean;
/**
* The list of all network names accepted by {@link validateNetworkName}
* @returns {string[]}
*/
export function allNetworkNames(): string[];
/**
* Entry point to generate extended private keys in a hierarchical deterministic wallet starting from a seed based
* on the [BIP-0032](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) standard
* (and the [SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md) for crypto suites other than Secp256k1).
*/
export class Bip32 {
  free(): void;
/**
* Calculates the master extended private key based on the crypto suite used by the given network. (At the moment
* only Secp256k1-based networks are supported in the WASM wrappers)
*
* @see allNetworkNames, validateNetworkName
* @param {Seed} seed
* @param {string} name
* @returns {Bip32Node}
*/
  static master(seed: Seed, name: string): Bip32Node;
}
/**
* In BIP-0032 each extended private key has the same operations, independently from the actual path. This struct represents such
* an extended private key in a given subtree.
*/
export class Bip32Node {
  free(): void;
/**
* Create a new node with normal (public) derivation with the given index.
* @param {number} idx
* @returns {Bip32Node}
*/
  deriveNormal(idx: number): Bip32Node;
/**
* Create a new node with hardened (private) derivation with the given index.
* @param {number} idx
* @returns {Bip32Node}
*/
  deriveHardened(idx: number): Bip32Node;
/**
* Creates the {@SecpPrivateKey} that belongs to this node for authenticating actions.
* @returns {SecpPrivateKey}
*/
  privateKey(): SecpPrivateKey;
/**
* Removes the ability to sign and derive hardened keys. The public node it returns is still able to provide
* normal derivation and signature verifications.
* @returns {Bip32PublicNode}
*/
  neuter(): Bip32PublicNode;
/**
* Returns the extended private key in the BIP32 readable format with the version bytes of the network.
*
* This is a secret that must not be kept unencrypted in transit or in rest!
* @param {string} name
* @returns {string}
*/
  toXprv(name: string): string;
/**
* Returns the private key in the Wallet Import Format with the version byte of the network.
*
* This is a secret that must not be kept unencrypted in transit or in rest!
*
* @see SecpPrivateKey.toWif
* @param {string} name
* @returns {string}
*/
  toWif(name: string): string;
/**
* Name of the network this node was generated for
*/
  readonly network: string;
/**
* The BIP32 path of this node
*/
  readonly path: string;
}
/**
* In BIP-0032 a neutered extended private key is an extended public key. This object represents
* such an extended public key in a given subtree. It is able to do normal (public) derivation,
* signature verification, creating and validating key identifiers
*/
export class Bip32PublicNode {
  free(): void;
/**
* Create a new node with normal (public) derivation with the given index.
* @param {number} idx
* @returns {Bip32PublicNode}
*/
  deriveNormal(idx: number): Bip32PublicNode;
/**
* Creates the public key that belongs to this node for verifying authentications done by the corresponding private key.
* @returns {SecpPublicKey}
*/
  publicKey(): SecpPublicKey;
/**
* Creates the key identifier for the public key. This is an extra layer of security for single-use keys, so the
* revealing of the public key can be delayed to the point when the authenticated action (spending some coin or
* revoking access) makes the public key irrelevant after the action is successful.
*
* Ark (and therefore Hydra) uses a different algorithm for calculating key identifiers. That is only available at
* {@link SecpPublicKey.arkKeyId}
* @returns {SecpKeyId}
*/
  keyId(): SecpKeyId;
/**
* Returns the extended public key in the BIP32 readable format with the version bytes of the network.
* @param {string} name
* @returns {string}
*/
  toXpub(name: string): string;
/**
* Returns the P2PKH address that belongs to this node using the version byte of the network.
* @param {string} name
* @returns {string}
*/
  toP2pkh(name: string): string;
/**
* Name of the network this node was generated for
*/
  readonly network: string;
/**
* The BIP32 path of this node
*/
  readonly path: string;
}
/**
* Tool for generating, validating and parsing [BIP-0039](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) phrases in different supported languages.
*/
export class Bip39 {
  free(): void;
/**
* Creates an object that can handle BIP39 phrases in a given language. (e.g. 'en')
* @param {string} lang_code
*/
  constructor(lang_code: string);
/**
* Creates a new phrase using the [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator)
* available on the platform.
* @returns {Bip39Phrase}
*/
  generate(): Bip39Phrase;
/**
* Creates a new phrase using the 256 bits of entropy provided in a buffer. IOP encourages using 24 word phrases everywhere.
* @param {Uint8Array} entropy
* @returns {Bip39Phrase}
*/
  entropy(entropy: Uint8Array): Bip39Phrase;
/**
* Creates a new phrase using the entropy provided in a buffer. This method is only for compatibility with other wallets. Check
* the BIP39 standard for the buffer sizes allowed.
* @param {Uint8Array} entropy
* @returns {Bip39Phrase}
*/
  shortEntropy(entropy: Uint8Array): Bip39Phrase;
/**
* Validates a whole BIP39 mnemonic phrase. Because the phrase contains some checksum, the whole phrase can be invalid even when
* each word itself is valid. Note also, that the standards only allows NFKD normalization of Unicode codepoints, and a single
* space between words, but this library is more tolerant and provides normalization for those.
* @param {string} phrase
*/
  validatePhrase(phrase: string): void;
/**
* Lists all words in the BIP39 dictionary, which start with the given prefix.
*
* Can be used in 3 different ways:
* - When the prefix is empty, the sorted list of all words are returned
* - When the prefix is a partial word, the returned list can be used for auto-completion
* - When the returned list is empty, the prefix is not a valid word in the dictionary
* @param {string} prefix
* @returns {any[]}
*/
  listWords(prefix: string): any[];
/**
* Validates a whole 24-word BIP39 mnemonic phrase and returns an intermediate object that can be
* later converted into a [`Seed`] with an optional password.
* @param {string} phrase
* @returns {Bip39Phrase}
*/
  phrase(phrase: string): Bip39Phrase;
/**
* Validates a whole BIP39 mnemonic phrase and returns an intermediate object similar to {@link phrase}. This method is only for
* compatibility with other wallets. Check the BIP39 standard for the number of words allowed.
* @param {string} phrase
* @returns {Bip39Phrase}
*/
  shortPhrase(phrase: string): Bip39Phrase;
}
/**
* An intermediate object that represents a BIP39 phrase with a known language
*/
export class Bip39Phrase {
  free(): void;
/**
* Creates a {@link Seed} from the phrase with the given password. Give empty string when the user did not provide any password.
* @param {string} password
* @returns {Seed}
*/
  password(password: string): Seed;
/**
* Returns the phrase as a readable string
*/
  readonly phrase: string;
}
/**
* Entry point to generate a hierarchical deterministic wallet using the [BIP-0044
* standard](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki). It is a more structured way to use the same seed for
* multiple coins, each with multiple accounts, each accounts with a new key for each transaction request. The standard is built on
* [BIP-0043](https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki) using the purpose code 44. And BIP-0043 itself uses
* BIP-0032 to derive all nodes from a single master extended private key.
*
* @see Bip32
*/
export class Bip44 {
  free(): void;
/**
* Creates the BIP32 root node for a given coin from the given seed based on the network.
* We use coin identifiers defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*
* @see validateNetworkName, Seed
* @param {Seed} seed
* @param {string} name
* @returns {Bip44Coin}
*/
  static network(seed: Seed, name: string): Bip44Coin;
}
/**
* Represents the private API of a given account of a given coin in the BIP32 tree.
*/
export class Bip44Account {
  free(): void;
/**
* Returns the underlying {@link Bip32Node}.
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* Creates a sub-account for either external keys (receiving addresses) or internal keys (change addresses). This distinction is
* a common practice that might help in accounting.
* @param {boolean} change
* @returns {Bip44SubAccount}
*/
  chain(change: boolean): Bip44SubAccount;
/**
* Creates a key with a given index used on the chain for storing balance or
* authenticating actions. By default these keys are made on the receiving sub-account.
* @param {number} idx
* @returns {Bip44Key}
*/
  key(idx: number): Bip44Key;
/**
* Neuters the account and converts it into its public API
* @returns {Bip44PublicAccount}
*/
  neuter(): Bip44PublicAccount;
/**
* Recreates the private API of a BIP44 account from its parts
* @param {number} account
* @param {string} xprv
* @param {string} network
* @returns {Bip44Account}
*/
  static fromXprv(account: number, xprv: string, network: string): Bip44Account;
/**
* Accessor for the account index.
*/
  readonly account: number;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the account.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
/**
* Returns the extended private key in the BIP32 readable format with the version bytes of the network.
*
* This is a secret that must not be kept unencrypted in transit or in rest!
*/
  readonly xprv: string;
}
/**
* Represents a given coin in the BIP32 tree.
*
* @see Bip32
*/
export class Bip44Coin {
  free(): void;
/**
* Returns the underlying {@link Bip32Node}.
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* Creates an account in the coin with the given account index.
* @param {number} account
* @returns {Bip44Account}
*/
  account(account: number): Bip44Account;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the coin.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
/**
* Returns the extended private key in the BIP32 readable format with the version bytes of the network.
*
* This is a secret that must not be kept unencrypted in transit or in rest!
*/
  readonly xprv: string;
}
/**
* Represents the private API of a key with a given index within a sub-account used on the chain for storing balance or
* authenticating actions.
*/
export class Bip44Key {
  free(): void;
/**
* Returns the underlying {@link Bip32Node}.
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* Creates the private key for authenticating actions.
* @returns {SecpPrivateKey}
*/
  privateKey(): SecpPrivateKey;
/**
* Neuters the key and converts it into its public API
* @returns {Bip44PublicKey}
*/
  neuter(): Bip44PublicKey;
/**
* Accessor for the account index.
*/
  readonly account: number;
/**
* Accessor for whether the sub-account is for change addresses.
*/
  readonly change: boolean;
/**
* Accessor for the key index within the sub-account.
*/
  readonly key: number;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the sub-account.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
/**
* Returns the private key in the Wallet Import Format with the version byte of the network.
*
* @see SecpPrivateKey.toWif
*/
  readonly wif: string;
}
/**
* Represents the public API of a given account of a given coin in the BIP32 tree.
*/
export class Bip44PublicAccount {
  free(): void;
/**
* Returns the underlying {@link Bip32PublicNode}.
* @returns {Bip32PublicNode}
*/
  node(): Bip32PublicNode;
/**
* Creates a sub-account for either external keys (receiving addresses) or internal keys (change addresses). This distinction is
* a common practice that might help in accounting.
* @param {boolean} change
* @returns {Bip44PublicSubAccount}
*/
  chain(change: boolean): Bip44PublicSubAccount;
/**
* Creates a key with a given index used on the chain for storing balance or
* authenticating actions. By default these keys are made on the receiving sub-account.
* @param {number} idx
* @returns {Bip44PublicKey}
*/
  key(idx: number): Bip44PublicKey;
/**
* Recreates the public API of a BIP44 account from its parts
* @param {number} account
* @param {string} xpub
* @param {string} network
* @returns {Bip44PublicAccount}
*/
  static fromXpub(account: number, xpub: string, network: string): Bip44PublicAccount;
/**
* Accessor for the account index.
*/
  readonly account: number;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the account.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
/**
* Returns the extended public key in the BIP32 readable format with the version bytes of the network.
*/
  readonly xpub: string;
}
/**
* Represents a public key with a given index within a sub-account used on the chain for verifying signatures or validating
* key identifiers.
*/
export class Bip44PublicKey {
  free(): void;
/**
* Returns the underlying {@link Bip32PublicNode}.
* @returns {Bip32PublicNode}
*/
  node(): Bip32PublicNode;
/**
* Creates the public key for verifying authentications done by this key.
* @returns {SecpPublicKey}
*/
  publicKey(): SecpPublicKey;
/**
* Creates the key identifier for the public key. This is an extra layer of security for single-use keys, so the
* revealing of the public key can be delayed to the point when the authenticated action (spending some coin or
* revoking access) makes the public key irrelevant after the action is successful.
*
* This method chooses the right algorithm used for creating key identifiers on the given network.
* @returns {SecpKeyId}
*/
  keyId(): SecpKeyId;
/**
* Accessor for the account index.
*/
  readonly account: number;
/**
* Returns the P2PKH address that belongs key with the version byte of the network.
*/
  readonly address: string;
/**
* Accessor for whether the sub-account is for change addresses.
*/
  readonly change: boolean;
/**
* Accessor for the key index within the sub-account.
*/
  readonly key: number;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the sub-account.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
}
/**
* Public API for a sub-account of a given account on a given coin that is either used for external keys (receiving addresses) or
* internal keys (change addresses). Some implementations do not distinguish these and just always use receiving
* addresses.
*/
export class Bip44PublicSubAccount {
  free(): void;
/**
* Returns the underlying {@link Bip32PublicNode}.
* @returns {Bip32PublicNode}
*/
  node(): Bip32PublicNode;
/**
* Creates a key with a given index used on the chain for storing balance or
* authenticating actions.
* @param {number} idx
* @returns {Bip44PublicKey}
*/
  key(idx: number): Bip44PublicKey;
/**
* Recreates the public API of a BIP44 sub-account from its parts
* @param {number} account
* @param {boolean} change
* @param {string} xpub
* @param {string} network
* @returns {Bip44PublicSubAccount}
*/
  static fromXpub(account: number, change: boolean, xpub: string, network: string): Bip44PublicSubAccount;
/**
* Accessor for the account index.
*/
  readonly account: number;
/**
* Accessor for whether the sub-account is for change addresses.
*/
  readonly change: boolean;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the sub-account.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
/**
* Returns the extended public key in the BIP32 readable format with the version bytes of the network.
*/
  readonly xpub: string;
}
/**
* Private API for a sub-account of a given account on a given coin that is either used for external keys (receiving addresses) or
* internal keys (change addresses). Some implementations do not distinguish these and just always use receiving
* addresses.
*/
export class Bip44SubAccount {
  free(): void;
/**
* Returns the underlying {@link Bip32Node}.
* @returns {Bip32Node}
*/
  node(): Bip32Node;
/**
* Creates a key with a given index used on the chain for storing balance or
* authenticating actions.
* @param {number} idx
* @returns {Bip44Key}
*/
  key(idx: number): Bip44Key;
/**
* Neuters the sub-account and converts it into its public API
* @returns {Bip44PublicSubAccount}
*/
  neuter(): Bip44PublicSubAccount;
/**
* Recreates the private API of a BIP44 sub-account from its parts
* @param {number} account
* @param {boolean} change
* @param {string} xprv
* @param {string} network
* @returns {Bip44SubAccount}
*/
  static fromXprv(account: number, change: boolean, xprv: string, network: string): Bip44SubAccount;
/**
* Accessor for the account index.
*/
  readonly account: number;
/**
* Accessor for whether the sub-account is for change addresses.
*/
  readonly change: boolean;
/**
* Accessor for the name of the underlying network.
*/
  readonly network: string;
/**
* Accessor for the BIP32 path of the sub-account.
*/
  readonly path: string;
/**
* The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
*/
  readonly slip44: number;
/**
* Returns the extended private key in the BIP32 readable format with the version bytes of the network.
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
* @returns {bigint}
*/
  fee(): bigint;
/**
* @returns {any}
*/
  toJSON(): any;
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
* @returns {bigint}
*/
  lastNonce(pk: PublicKey): bigint;
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
*/
  readonly corrupted: boolean;
/**
*/
  readonly lastSeenHeight: number;
/**
*/
  readonly version: bigint;
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
* @param {bigint} nonce
* @returns {any}
*/
  build(ops: SignedBundle, sender_pubkey: SecpPublicKey, nonce: bigint): any;
}
/**
* An object representing a valid DID. This identifier can be used to look up a DID document
* on multiple blockchains. Without any on-chain SSI transactions, there will be a single
* key that can update and impersonate the DID, which has the default key identifier.
*
* @see defaultKeyId
*/
export class Did {
  free(): void;
/**
* Try to parse a string into a DID
* @param {string} did_str
*/
  constructor(did_str: string);
/**
* All DID strings start with this prefix
* @returns {string}
*/
  static prefix(): string;
/**
* Creates a DID from a multicipher {@KeyId}, so the default key identifier of the DID
* will match that.
*
* @see defaultKeyId
* @param {KeyId} key_id
* @returns {Did}
*/
  static fromKeyId(key_id: KeyId): Did;
/**
* Returns the default key identifier for a DID that has update and impersonation rights
* unless the DID document was modified on chain.
* @returns {KeyId}
*/
  defaultKeyId(): KeyId;
/**
* Converts the DID into a string like `did:morpheus:ezBlah`
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
* Builder object for creating and signing a JWT (JSON Web Token) with or without an associated content.
*
* @see JwtParser
*/
export class JwtBuilder {
  free(): void;
/**
* Creates a new JWT without an associated content. The time of creation is set
* in this call.
*/
  constructor();
/**
* Creates a new JWT without an associated content. The time of creation is set
* in this call.
* @param {string} content_id
* @returns {JwtBuilder}
*/
  static withContentId(content_id: string): JwtBuilder;
/**
* Signs and serializes the token with the given multicipher {@link PrivateKey}
* @param {PrivateKey} sk
* @returns {string}
*/
  sign(sk: PrivateKey): string;
/**
* Gets how long the token is valid. (5 seconds by default)
*/
  timeToLive: bigint;
}
/**
* Parser for reading a JWT (JSON Web Token) from a string and validate its content and signature.
*/
export class JwtParser {
  free(): void;
/**
* Parse JWT from a string created with {@link JwtBuilder}
* @param {string} token
*/
  constructor(token: string);
/**
* Returns the UTC date-time instance the token was created
*/
  readonly createdAt: bigint;
/**
* Returns the public key that signed the token
*/
  readonly publicKey: PublicKey;
/**
* Returns how long the token stays valid
*/
  readonly timeToLive: bigint;
}
/**
* Multicipher key id (fingerprint/digest/hash of a public key)
*
* In some algorithms the public key is only revealed in point-to-point
* communications and a keypair is identified only by the digest of the public
* key in all other channels.
*/
export class KeyId {
  free(): void;
/**
* Parses a string into a {@link KeyId}.
* @param {string} key_id_str
*/
  constructor(key_id_str: string);
/**
* Converts a {@link SecpKeyId} into a multicipher {@link KeyId}.
* @param {SecpKeyId} secp
* @returns {KeyId}
*/
  static fromSecp(secp: SecpKeyId): KeyId;
/**
* All multicipher key ids start with this prefix
* @returns {string}
*/
  static prefix(): string;
/**
* Converts a {@link KeyId} into a string.
* @returns {string}
*/
  toString(): string;
}
/**
* Starting point for deriving all Morpheus related keys in a BIP32 hierarchy. Morpheus uses Ed25519 cipher and currently there are no
* WASM wrappers for Bip32 nodes with that cipher. Still, Bip32 paths are returned by each object so compatible wallets can derive the
* same extended private keys.
*/
export class Morpheus {
  free(): void;
/**
* Calculate the root node of the Morpheus subtree in the HD wallet defined by a seed.
* @param {Seed} seed
* @returns {MorpheusRoot}
*/
  static root(seed: Seed): MorpheusRoot;
}
/**
* Root node of a specific kind of DIDs. The kind used to derive a DID is indistiguishable outside the wallet.
*/
export class MorpheusKind {
  free(): void;
/**
* Creates a {@link MorpheusPrivateKey} with the given index under this subtree.
* E.g. 5th persona, 3rd device, or 0th group, etc.
* @param {number} idx
* @returns {MorpheusPrivateKey}
*/
  key(idx: number): MorpheusPrivateKey;
/**
* Accessor for the kind of DIDs in this subtree
*/
  readonly kind: string;
/**
* Accessor for the BIP32 path of the morpheus subtree for a DID kind.
*/
  readonly path: string;
}
/**
* The operations on an identifier that require the private key to be available in memory.
*/
export class MorpheusPrivateKey {
  free(): void;
/**
* Creates the public interface of the node that does not need the private key in memory.
* @returns {MorpheusPublicKey}
*/
  neuter(): MorpheusPublicKey;
/**
* Returns the multicipher {@link PrivateKey} that belongs to this key.
* @returns {PrivateKey}
*/
  privateKey(): PrivateKey;
/**
* Index of the key in its subtree.
*/
  readonly idx: number;
/**
* Accessor for the kind of DIDs in this subtree
*/
  readonly kind: string;
/**
* Accessor for the BIP32 path of the morpheus key.
*/
  readonly path: string;
}
/**
* The operations on an identifier that do not require the private key to be available in memory.
*/
export class MorpheusPublicKey {
  free(): void;
/**
* Returns the multicipher {@link PublicKey} that belongs to this key.
* @returns {PublicKey}
*/
  publicKey(): PublicKey;
/**
* Index of the key in its subtree.
*/
  readonly idx: number;
/**
* Accessor for the kind of DIDs in this subtree
*/
  readonly kind: string;
/**
* Accessor for the BIP32 path of the morpheus key.
*/
  readonly path: string;
}
/**
* Representation of the root node of the Morpheus subtree in the HD wallet.
*/
export class MorpheusRoot {
  free(): void;
/**
* Derive a separate HD wallet subtree of the given DID kind. Use 'persona', 'device', 'group' or 'resource' in
* singular as a parameter.
* @param {string} did_kind
* @returns {MorpheusKind}
*/
  kind(did_kind: string): MorpheusKind;
/**
* Alias for kind('persona')
* @returns {MorpheusKind}
*/
  personas(): MorpheusKind;
/**
* Alias for kind('device')
* @returns {MorpheusKind}
*/
  devices(): MorpheusKind;
/**
* Alias for kind('group')
* @returns {MorpheusKind}
*/
  groups(): MorpheusKind;
/**
* Alias for kind('resource')
* @returns {MorpheusKind}
*/
  resources(): MorpheusKind;
/**
* Accessor for the BIP32 path of the morpheus root.
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
* @param {bigint} nonce
* @returns {NoncedBundle}
*/
  build(nonce: bigint): NoncedBundle;
}
/**
*/
export class Price {
  free(): void;
/**
*/
  readonly fee: bigint;
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
* Multicipher private key
*
* A private key (also called secret key or sk in some literature) is the part of an asymmetric keypair
* which is never shared with anyone. It is used to sign a message sent to any recipient or to decrypt a
* message that was sent encrypted from any recipients.
*
* In general it is discouraged to serialize and transfer secrets over a network, so you might be missing
* some of those methods. The exception to this rule for compatibility is to support for deserializing
* [WIF](https://en.bitcoin.it/wiki/Wallet_import_format) strings usual in BTC wallets.
*/
export class PrivateKey {
  free(): void;
/**
* Converts a {@link SecpPrivateKey} into a multicipher {@link PrivateKey}.
* @param {SecpPrivateKey} sk
* @returns {PrivateKey}
*/
  static fromSecp(sk: SecpPrivateKey): PrivateKey;
/**
* Calculates the public key the belongs to this private key.
* @returns {PublicKey}
*/
  publicKey(): PublicKey;
/**
* Calculates the signature of a message that can be then verified using {@link PublicKey.validate_ecdsa}
* @param {Uint8Array} data
* @returns {Signature}
*/
  signEcdsa(data: Uint8Array): Signature;
}
/**
* Multicipher public key
*
* A public key (also called shared key or pk in some literature) is that part
* of an asymmetric keypair which can be used to verify the authenticity of the
* sender of a message or to encrypt a message that can only be decrypted by a
* single recipient. In both cases this other party owns the {@link PrivateKey}
* part of the keypair and never shares it with anyone else.
*/
export class PublicKey {
  free(): void;
/**
* Parses a string into a {@link PublicKey}.
* @param {string} pub_key_str
*/
  constructor(pub_key_str: string);
/**
* Converts a {@link SecpPublicKey} into a multicipher {@link PublicKey}.
* @param {SecpPublicKey} pk
* @returns {PublicKey}
*/
  static fromSecp(pk: SecpPublicKey): PublicKey;
/**
* All multicipher public keys start with this prefix
* @returns {string}
*/
  static prefix(): string;
/**
* Calculates the key id (also called fingerprint or address in some
* literature) of the public key.
* @returns {KeyId}
*/
  keyId(): KeyId;
/**
* Validates if `key_id` belongs to this public key
*
* We do not yet have multiple versions of key ids for the same multicipher
* public key, so for now this comparison is trivial. But when we introduce
* newer versions, we need to take the version of the `key_id` argument
* into account and calculate that possibly older version from `self`.
* @param {KeyId} key_id
* @returns {boolean}
*/
  validateId(key_id: KeyId): boolean;
/**
* This method can be used to verify if a given signature for a message was
* made using the private key that belongs to this public key.
*
* @see PrivateKey.sign
* @param {Uint8Array} data
* @param {Signature} signature
* @returns {boolean}
*/
  validateEcdsa(data: Uint8Array, signature: Signature): boolean;
/**
* Converts a {@link PublicKey} into a string.
* @returns {string}
*/
  toString(): string;
}
/**
* Secp256k1 key id (fingerprint/digest/hash of a public key)
*/
export class SecpKeyId {
  free(): void;
/**
* Deserializes the key identifier from a `p2pkh` bitcoin address
* @param {string} address
* @param {string} network
* @returns {SecpKeyId}
*/
  static fromAddress(address: string, network: string): SecpKeyId;
/**
* Serializes the key identifier as a `p2pkh` bitcoin address
* @param {string} network
* @returns {string}
*/
  toAddress(network: string): string;
}
/**
* Secp256k1 private key
*/
export class SecpPrivateKey {
  free(): void;
/**
* Creates a {@link SecpPrivateKey} from a passphrase compatible with ark.io wallets.
*
* An Ark passphrase is a secret that must not be kept unencrypted in transit or in rest!
* @param {string} phrase
* @returns {SecpPrivateKey}
*/
  static fromArkPassphrase(phrase: string): SecpPrivateKey;
/**
* Creates a {@link SecpPrivateKey} from a WIF string compatible with BTC-related wallets. The
* second argument is a network name, that {@link validateNetworkName} accepts.
*
* A WIF is a secret that must not be kept unencrypted in transit or in rest!
* @param {string} wif
* @param {string} network
* @returns {SecpPrivateKey}
*/
  static fromWif(wif: string, network: string): SecpPrivateKey;
/**
* Creates a WIF string compatible with BTC-related wallets. The second argument is a
* network name, that {@link validateNetworkName} accepts.
*
* This is a secret that must not be kept unencrypted in transit or in rest!
* @param {string} network
* @returns {string}
*/
  toWif(network: string): string;
/**
* Calculates the public key the belongs to this private key.
* @returns {SecpPublicKey}
*/
  publicKey(): SecpPublicKey;
/**
* Calculates the signature of a message that can be then verified using {@link SecpPublicKey.validate_ecdsa}
* @param {Uint8Array} data
* @returns {SecpSignature}
*/
  signEcdsa(data: Uint8Array): SecpSignature;
}
/**
* Secp256k1 public key
*/
export class SecpPublicKey {
  free(): void;
/**
* Parses a string into a {@link SecpPublicKey}.
* @param {string} key
*/
  constructor(key: string);
/**
* Calculates the key id (also called fingerprint or address in some
* literature) of the public key.
* @returns {SecpKeyId}
*/
  keyId(): SecpKeyId;
/**
* Calculates the key id of the public key the non-standard way ark.io and
* therefore Hydra uses.
*
* Regular bitcoin-based chains use the ripemd160 hash of the sha2-256 hash
* of the public key, but ARK only uses ripemd160.
* @returns {SecpKeyId}
*/
  arkKeyId(): SecpKeyId;
/**
* Validates if `key_id` belongs to this public key
* @param {SecpKeyId} key_id
* @returns {boolean}
*/
  validateId(key_id: SecpKeyId): boolean;
/**
* Validates if `key_id` belongs to this public key if it was generated
* the ark.io way.
* @param {SecpKeyId} key_id
* @returns {boolean}
*/
  validateArkId(key_id: SecpKeyId): boolean;
/**
* This method can be used to verify if a given signature for a message was
* made using the private key that belongs to this public key.
* @param {Uint8Array} data
* @param {SecpSignature} signature
* @returns {boolean}
*/
  validateEcdsa(data: Uint8Array, signature: SecpSignature): boolean;
/**
* Converts a {@link SecpPublicKey} into a string.
* @returns {string}
*/
  toString(): string;
}
/**
* Secp256k1 signature
*/
export class SecpSignature {
  free(): void;
/**
* Deserializes an ASN.1 DER encoded buffer into a {@link SepcSignature}
* @param {Uint8Array} bytes
* @returns {SecpSignature}
*/
  static fromDer(bytes: Uint8Array): SecpSignature;
/**
* Serializes a {@link SepcSignature} into an ASN.1 DER encoded buffer
* @returns {Uint8Array}
*/
  toDer(): Uint8Array;
/**
* Converts a {@link SecpSignature} into a string.
* @returns {string}
*/
  toString(): string;
}
/**
* The seed used for BIP32 derivations. A seed cannot be turned back into a
* phrase, because there is salted hashing involed in creating it from the
* BIP39 mnemonic phrase.
*/
export class Seed {
  free(): void;
/**
* Creates seed from a raw 512-bit binary seed
* @param {Uint8Array} bytes
*/
  constructor(bytes: Uint8Array);
/**
* A BIP39 phrase we use in most of the demo videos and proof-of-concept
* applications. Do not use it in production code.
* @returns {string}
*/
  static demoPhrase(): string;
/**
* Legacy password used in the 0.0.1 version of the crate. Since 0.0.2 the
* crate always requires a password, which should be "" by default when
* the user does not provide one. (BIP39 standard for "25th word")
* @returns {string}
*/
  static legacyPassword(): string;
/**
* Returns the 512-bit binary representation of the seed
* @returns {Uint8Array}
*/
  toBytes(): Uint8Array;
}
/**
* Multicipher signature
*/
export class Signature {
  free(): void;
/**
* Parses a string into a {@link Signature}.
* @param {string} sign_str
*/
  constructor(sign_str: string);
/**
* Converts a {@link SecpSignature} into a multicipher {@link Signature}.
* @param {SecpSignature} secp
* @returns {Signature}
*/
  static fromSecp(secp: SecpSignature): Signature;
/**
* All multicipher signatures start with this prefix
* @returns {string}
*/
  static prefix(): string;
/**
* Converts a {@link Signature} into a string.
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
* Binary data signed by a multicipher key.
*/
export class SignedBytes {
  free(): void;
/**
* Create {@link SignedBytes} from its parts.
* @param {PublicKey} public_key
* @param {Uint8Array} content
* @param {Signature} signature
*/
  constructor(public_key: PublicKey, content: Uint8Array, signature: Signature);
/**
* Verify if {@link signature} was made by the private key that belongs to {@link publicKey} on the {@link content}.
* @returns {boolean}
*/
  validate(): boolean;
/**
* Not only validate the signature, but also check if the provided {@link KeyId} was made from {@link publicKey}.
*
* @see validate
* @param {KeyId} signer_id
* @returns {boolean}
*/
  validateWithKeyId(signer_id: KeyId): boolean;
/**
* Not only validate the signature, but also check the signing key had impersonation right the whole time period specified by the
* optional upper and lower block height boundaries. The DID document serialized as a string provides the whole history of key
* rights, so depending on the use-case there are three possible outcomes:
*
* - The signing key had impersonation right the whole time and the signature is valid (green)
* - Cannot prove if the signing key had impersonation right the whole time, but no other issues found (yellow)
* - The signature is invalid or we can prove the signing key did not have impersonation right at any point in
*   the given time interval (red)
*
* The return value is a {@link ValidationResult}
* @param {string} did_doc_str
* @param {number | undefined} from_height_inc
* @param {number | undefined} until_height_exc
* @returns {any}
*/
  validateWithDidDoc(did_doc_str: string, from_height_inc?: number, until_height_exc?: number): any;
/**
* Accessor of the binary data.
*/
  readonly content: Uint8Array;
/**
* Accessor of the {@link PublicKey} that signed the binary data.
*/
  readonly publicKey: PublicKey;
/**
* Accessor of the {@link Signature}.
*/
  readonly signature: Signature;
}
/**
* JSON signed by a multicipher key. Since the signature is done on a digest created by {@link digestJson}, the same signature can be
* validated against different selectively revealed JSON documents.
*
* @see selectiveDigestJson
*/
export class SignedJson {
  free(): void;
/**
* Create {@link SignedJson} from its parts.
* @param {PublicKey} public_key
* @param {any} content
* @param {Signature} signature
*/
  constructor(public_key: PublicKey, content: any, signature: Signature);
/**
* Verify if {@link signature} was made by the private key that belongs to {@link publicKey} on the {@link content}.
* @returns {boolean}
*/
  validate(): boolean;
/**
* Not only validate the signature, but also check if the provided {@link KeyId} was made from {@link publicKey}.
*
* @see validate
* @param {KeyId} signer_id
* @returns {boolean}
*/
  validateWithKeyId(signer_id: KeyId): boolean;
/**
* Not only validate the signature, but also check the signing key had impersonation right the whole time period specified by the
* optional upper and lower block height boundaries. The DID document serialized as a string provides the whole history of key
* rights, so depending on the use-case there are three possible outcomes:
*
* - The signing key had impersonation right the whole time and the signature is valid (green)
* - Cannot prove if the signing key had impersonation right the whole time, but no other issues found (yellow)
* - The signature is invalid or we can prove the signing key did not have impersonation right at any point in
*   the given time interval (red)
*
* The return value is a {@link ValidationResult}
* @param {string} did_doc_str
* @param {number | undefined} from_height_inc
* @param {number | undefined} until_height_exc
* @returns {any}
*/
  validateWithDidDoc(did_doc_str: string, from_height_inc?: number, until_height_exc?: number): any;
/**
* Serialize this object as a JSON in a format used by IOP SSI in several places
* @returns {any}
*/
  toJSON(): any;
/**
* Deserialize a {@SignedJson} from a JSON in a format used by IOP SSI in several places
* @param {any} json
* @returns {SignedJson}
*/
  static fromJSON(json: any): SignedJson;
/**
* Accessor of the JSON content.
*/
  readonly content: any;
/**
* Accessor of the {@link PublicKey} that signed the binary data.
*/
  readonly publicKey: PublicKey;
/**
* Accessor of the {@link Signature}.
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
* A single issue found while validating against a DID document.
*
* @see SignedBytes.validateWithDidDoc, SignedJson.validateWithDidDoc
*/
export class ValidationIssue {
  free(): void;
/**
* Error code of the issue
*/
  readonly code: number;
/**
* Description of the issue as a string
*/
  readonly reason: string;
/**
* Severity of the issue ('warning' or 'error')
*/
  readonly severity: string;
}
/**
* All issues found while validating against a DID document.
*
* @see SignedBytes.validateWithDidDoc, SignedJson.validateWithDidDoc
*/
export class ValidationResult {
  free(): void;
/**
* An array of all issues. Treat each item as a {@link ValidationIssue}.
*/
  readonly messages: any[];
/**
* Status of the validation based on the highest severity found among the issues ('invalid', 'maybe valid' or 'valid')
*/
  readonly status: string;
}
