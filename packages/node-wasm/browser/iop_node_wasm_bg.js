import * as wasm from './iop_node_wasm_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0;
function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0;
function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}

let cachedUint32Memory0;
function getUint32Memory0() {
    if (cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
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
export function selectiveDigestJson(data, keep_properties_list) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(keep_properties_list, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.selectiveDigestJson(retptr, addBorrowedObject(data), ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr1 = r0;
        var len1 = r1;
        if (r3) {
            ptr1 = 0; len1 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = undefined;
        wasm.__wbindgen_free(ptr1, len1);
    }
}

/**
* Calculates the digest of a JSON document. Since this digest is calculated by recursively replacing sub-objects with their digest,
* it is possible to selectively reveal parts of the document using {@link selectiveDigestJson}
* @param {any} data
* @returns {string}
*/
export function digestJson(data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.digestJson(retptr, addBorrowedObject(data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr0 = r0;
        var len0 = r1;
        if (r3) {
            ptr0 = 0; len0 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr0, len0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = undefined;
        wasm.__wbindgen_free(ptr0, len0);
    }
}

/**
* This function provides a canonical string for any JSON document. Order of the keys in objects, whitespace
* and unicode normalization are all taken care of, so document that belongs to a single digest is not malleable.
*
* This is a drop-in replacement for `JSON.stringify(data)`
* @param {any} data
* @returns {string}
*/
export function stringifyJson(data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.stringifyJson(retptr, addBorrowedObject(data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr0 = r0;
        var len0 = r1;
        if (r3) {
            ptr0 = 0; len0 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr0, len0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = undefined;
        wasm.__wbindgen_free(ptr0, len0);
    }
}

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
export function wrapWithNonce(data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.wrapWithNonce(retptr, addBorrowedObject(data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = undefined;
    }
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

const int64CvtShim = new BigInt64Array(u32CvtShim.buffer);
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
export function encrypt(plain_text, password) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(plain_text, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.encrypt(retptr, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        if (r3) {
            throw takeObject(r2);
        }
        var v2 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* Decrypts the ciphertext with a password. The format of the ciphertext is
* defined by the {@link encrypt} function. Only the matching password will decrypt
* the ciphertext.
* @param {Uint8Array} cipher_text
* @param {string} password
* @returns {Uint8Array}
*/
export function decrypt(cipher_text, password) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(cipher_text, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.decrypt(retptr, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        if (r3) {
            throw takeObject(r2);
        }
        var v2 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* Free function that checks if a string is a valid network name usable as a parameter in some other calls.
*
* @see allNetworkNames
* @param {string} name
* @returns {boolean}
*/
export function validateNetworkName(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateNetworkName(ptr0, len0);
    return ret !== 0;
}

/**
* The list of all network names accepted by {@link validateNetworkName}
* @returns {string[]}
*/
export function allNetworkNames() {
    const ret = wasm.allNetworkNames();
    return takeObject(ret);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* Entry point to generate extended private keys in a hierarchical deterministic wallet starting from a seed based
* on the [BIP-0032](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) standard
* (and the [SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md) for crypto suites other than Secp256k1).
*/
export class Bip32 {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip32_free(ptr);
    }
    /**
    * Calculates the master extended private key based on the crypto suite used by the given network. (At the moment
    * only Secp256k1-based networks are supported in the WASM wrappers)
    *
    * @see allNetworkNames, validateNetworkName
    * @param {Seed} seed
    * @param {string} name
    * @returns {Bip32Node}
    */
    static master(seed, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(seed, Seed);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip32_master(retptr, seed.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip32Node.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* In BIP-0032 each extended private key has the same operations, independently from the actual path. This struct represents such
* an extended private key in a given subtree.
*/
export class Bip32Node {

    static __wrap(ptr) {
        const obj = Object.create(Bip32Node.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip32node_free(ptr);
    }
    /**
    * Name of the network this node was generated for
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32node_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * The BIP32 path of this node
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32node_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Create a new node with normal (public) derivation with the given index.
    * @param {number} idx
    * @returns {Bip32Node}
    */
    deriveNormal(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32node_deriveNormal(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip32Node.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new node with hardened (private) derivation with the given index.
    * @param {number} idx
    * @returns {Bip32Node}
    */
    deriveHardened(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32node_deriveHardened(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip32Node.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates the {@SecpPrivateKey} that belongs to this node for authenticating actions.
    * @returns {SecpPrivateKey}
    */
    privateKey() {
        const ret = wasm.bip32node_privateKey(this.ptr);
        return SecpPrivateKey.__wrap(ret);
    }
    /**
    * Removes the ability to sign and derive hardened keys. The public node it returns is still able to provide
    * normal derivation and signature verifications.
    * @returns {Bip32PublicNode}
    */
    neuter() {
        const ret = wasm.bip32node_neuter(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * Returns the extended private key in the BIP32 readable format with the version bytes of the network.
    *
    * This is a secret that must not be kept unencrypted in transit or in rest!
    * @param {string} name
    * @returns {string}
    */
    toXprv(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip32node_toXprv(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * Returns the private key in the Wallet Import Format with the version byte of the network.
    *
    * This is a secret that must not be kept unencrypted in transit or in rest!
    *
    * @see SecpPrivateKey.toWif
    * @param {string} name
    * @returns {string}
    */
    toWif(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip32node_toWif(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
}
/**
* In BIP-0032 a neutered extended private key is an extended public key. This object represents
* such an extended public key in a given subtree. It is able to do normal (public) derivation,
* signature verification, creating and validating key identifiers
*/
export class Bip32PublicNode {

    static __wrap(ptr) {
        const obj = Object.create(Bip32PublicNode.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip32publicnode_free(ptr);
    }
    /**
    * Name of the network this node was generated for
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32publicnode_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * The BIP32 path of this node
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32publicnode_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Create a new node with normal (public) derivation with the given index.
    * @param {number} idx
    * @returns {Bip32PublicNode}
    */
    deriveNormal(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32publicnode_deriveNormal(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip32PublicNode.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates the public key that belongs to this node for verifying authentications done by the corresponding private key.
    * @returns {SecpPublicKey}
    */
    publicKey() {
        const ret = wasm.bip32publicnode_publicKey(this.ptr);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * Creates the key identifier for the public key. This is an extra layer of security for single-use keys, so the
    * revealing of the public key can be delayed to the point when the authenticated action (spending some coin or
    * revoking access) makes the public key irrelevant after the action is successful.
    *
    * Ark (and therefore Hydra) uses a different algorithm for calculating key identifiers. That is only available at
    * {@link SecpPublicKey.arkKeyId}
    * @returns {SecpKeyId}
    */
    keyId() {
        const ret = wasm.bip32publicnode_keyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * Returns the extended public key in the BIP32 readable format with the version bytes of the network.
    * @param {string} name
    * @returns {string}
    */
    toXpub(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip32publicnode_toXpub(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * Returns the P2PKH address that belongs to this node using the version byte of the network.
    * @param {string} name
    * @returns {string}
    */
    toP2pkh(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip32publicnode_toP2pkh(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
}
/**
* Tool for generating, validating and parsing [BIP-0039](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) phrases in different supported languages.
*/
export class Bip39 {

    static __wrap(ptr) {
        const obj = Object.create(Bip39.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip39_free(ptr);
    }
    /**
    * Creates an object that can handle BIP39 phrases in a given language. (e.g. 'en')
    * @param {string} lang_code
    */
    constructor(lang_code) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(lang_code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip39.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a new phrase using the [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator)
    * available on the platform.
    * @returns {Bip39Phrase}
    */
    generate() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip39_generate(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip39Phrase.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a new phrase using the 256 bits of entropy provided in a buffer. IOP encourages using 24 word phrases everywhere.
    * @param {Uint8Array} entropy
    * @returns {Bip39Phrase}
    */
    entropy(entropy) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(entropy, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_entropy(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip39Phrase.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a new phrase using the entropy provided in a buffer. This method is only for compatibility with other wallets. Check
    * the BIP39 standard for the buffer sizes allowed.
    * @param {Uint8Array} entropy
    * @returns {Bip39Phrase}
    */
    shortEntropy(entropy) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(entropy, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_shortEntropy(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip39Phrase.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Validates a whole BIP39 mnemonic phrase. Because the phrase contains some checksum, the whole phrase can be invalid even when
    * each word itself is valid. Note also, that the standards only allows NFKD normalization of Unicode codepoints, and a single
    * space between words, but this library is more tolerant and provides normalization for those.
    * @param {string} phrase
    */
    validatePhrase(phrase) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_validatePhrase(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    listWords(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_listWords(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Validates a whole 24-word BIP39 mnemonic phrase and returns an intermediate object that can be
    * later converted into a [`Seed`] with an optional password.
    * @param {string} phrase
    * @returns {Bip39Phrase}
    */
    phrase(phrase) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_phrase(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip39Phrase.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Validates a whole BIP39 mnemonic phrase and returns an intermediate object similar to {@link phrase}. This method is only for
    * compatibility with other wallets. Check the BIP39 standard for the number of words allowed.
    * @param {string} phrase
    * @returns {Bip39Phrase}
    */
    shortPhrase(phrase) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip39_shortPhrase(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip39Phrase.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* An intermediate object that represents a BIP39 phrase with a known language
*/
export class Bip39Phrase {

    static __wrap(ptr) {
        const obj = Object.create(Bip39Phrase.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip39phrase_free(ptr);
    }
    /**
    * Creates a {@link Seed} from the phrase with the given password. Give empty string when the user did not provide any password.
    * @param {string} password
    * @returns {Seed}
    */
    password(password) {
        const ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.bip39phrase_password(this.ptr, ptr0, len0);
        return Seed.__wrap(ret);
    }
    /**
    * Returns the phrase as a readable string
    */
    get phrase() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip39phrase_phrase(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
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

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44_free(ptr);
    }
    /**
    * Creates the BIP32 root node for a given coin from the given seed based on the network.
    * We use coin identifiers defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    *
    * @see validateNetworkName, Seed
    * @param {Seed} seed
    * @param {string} name
    * @returns {Bip44Coin}
    */
    static network(seed, name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(seed, Seed);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.bip44_network(retptr, seed.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44Coin.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* Represents the private API of a given account of a given coin in the BIP32 tree.
*/
export class Bip44Account {

    static __wrap(ptr) {
        const obj = Object.create(Bip44Account.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44account_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32Node}.
    * @returns {Bip32Node}
    */
    node() {
        const ret = wasm.bip44account_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44account_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates a sub-account for either external keys (receiving addresses) or internal keys (change addresses). This distinction is
    * a common practice that might help in accounting.
    * @param {boolean} change
    * @returns {Bip44SubAccount}
    */
    chain(change) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44account_chain(retptr, this.ptr, change);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44SubAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a key with a given index used on the chain for storing balance or
    * authenticating actions. By default these keys are made on the receiving sub-account.
    * @param {number} idx
    * @returns {Bip44Key}
    */
    key(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44account_key(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44Key.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44account_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the account index.
    */
    get account() {
        const ret = wasm.bip44account_account(this.ptr);
        return ret;
    }
    /**
    * Accessor for the BIP32 path of the account.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44account_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Neuters the account and converts it into its public API
    * @returns {Bip44PublicAccount}
    */
    neuter() {
        const ret = wasm.bip44account_neuter(this.ptr);
        return Bip44PublicAccount.__wrap(ret);
    }
    /**
    * Recreates the private API of a BIP44 account from its parts
    * @param {number} account
    * @param {string} xprv
    * @param {string} network
    * @returns {Bip44Account}
    */
    static fromXprv(account, xprv, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(xprv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.bip44account_fromXprv(retptr, account, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44Account.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the extended private key in the BIP32 readable format with the version bytes of the network.
    *
    * This is a secret that must not be kept unencrypted in transit or in rest!
    */
    get xprv() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44account_to_xprv(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Represents a given coin in the BIP32 tree.
*
* @see Bip32
*/
export class Bip44Coin {

    static __wrap(ptr) {
        const obj = Object.create(Bip44Coin.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44coin_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32Node}.
    * @returns {Bip32Node}
    */
    node() {
        const ret = wasm.bip44coin_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44coin_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates an account in the coin with the given account index.
    * @param {number} account
    * @returns {Bip44Account}
    */
    account(account) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44coin_account(retptr, this.ptr, account);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44Account.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44coin_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the BIP32 path of the coin.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44coin_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns the extended private key in the BIP32 readable format with the version bytes of the network.
    *
    * This is a secret that must not be kept unencrypted in transit or in rest!
    */
    get xprv() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44coin_to_xprv(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Represents the private API of a key with a given index within a sub-account used on the chain for storing balance or
* authenticating actions.
*/
export class Bip44Key {

    static __wrap(ptr) {
        const obj = Object.create(Bip44Key.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44key_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32Node}.
    * @returns {Bip32Node}
    */
    node() {
        const ret = wasm.bip44key_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44key_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates the private key for authenticating actions.
    * @returns {SecpPrivateKey}
    */
    privateKey() {
        const ret = wasm.bip44key_privateKey(this.ptr);
        return SecpPrivateKey.__wrap(ret);
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44key_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the account index.
    */
    get account() {
        const ret = wasm.bip44key_account(this.ptr);
        return ret;
    }
    /**
    * Accessor for whether the sub-account is for change addresses.
    */
    get change() {
        const ret = wasm.bip44key_change(this.ptr);
        return ret !== 0;
    }
    /**
    * Accessor for the key index within the sub-account.
    */
    get key() {
        const ret = wasm.bip44key_key(this.ptr);
        return ret;
    }
    /**
    * Accessor for the BIP32 path of the sub-account.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44key_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Neuters the key and converts it into its public API
    * @returns {Bip44PublicKey}
    */
    neuter() {
        const ret = wasm.bip44key_neuter(this.ptr);
        return Bip44PublicKey.__wrap(ret);
    }
    /**
    * Returns the private key in the Wallet Import Format with the version byte of the network.
    *
    * @see SecpPrivateKey.toWif
    */
    get wif() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44key_to_wif(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Represents the public API of a given account of a given coin in the BIP32 tree.
*/
export class Bip44PublicAccount {

    static __wrap(ptr) {
        const obj = Object.create(Bip44PublicAccount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44publicaccount_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32PublicNode}.
    * @returns {Bip32PublicNode}
    */
    node() {
        const ret = wasm.bip44publicaccount_node(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicaccount_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates a sub-account for either external keys (receiving addresses) or internal keys (change addresses). This distinction is
    * a common practice that might help in accounting.
    * @param {boolean} change
    * @returns {Bip44PublicSubAccount}
    */
    chain(change) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicaccount_chain(retptr, this.ptr, change);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44PublicSubAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a key with a given index used on the chain for storing balance or
    * authenticating actions. By default these keys are made on the receiving sub-account.
    * @param {number} idx
    * @returns {Bip44PublicKey}
    */
    key(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicaccount_key(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44PublicKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44publicaccount_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the account index.
    */
    get account() {
        const ret = wasm.bip44publicaccount_account(this.ptr);
        return ret;
    }
    /**
    * Accessor for the BIP32 path of the account.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicaccount_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Recreates the public API of a BIP44 account from its parts
    * @param {number} account
    * @param {string} xpub
    * @param {string} network
    * @returns {Bip44PublicAccount}
    */
    static fromXpub(account, xpub, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(xpub, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.bip44publicaccount_fromXpub(retptr, account, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44PublicAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the extended public key in the BIP32 readable format with the version bytes of the network.
    */
    get xpub() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicaccount_to_xpub(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Represents a public key with a given index within a sub-account used on the chain for verifying signatures or validating
* key identifiers.
*/
export class Bip44PublicKey {

    static __wrap(ptr) {
        const obj = Object.create(Bip44PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44publickey_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32PublicNode}.
    * @returns {Bip32PublicNode}
    */
    node() {
        const ret = wasm.bip44publickey_node(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publickey_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates the public key for verifying authentications done by this key.
    * @returns {SecpPublicKey}
    */
    publicKey() {
        const ret = wasm.bip44publickey_publicKey(this.ptr);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * Creates the key identifier for the public key. This is an extra layer of security for single-use keys, so the
    * revealing of the public key can be delayed to the point when the authenticated action (spending some coin or
    * revoking access) makes the public key irrelevant after the action is successful.
    *
    * This method chooses the right algorithm used for creating key identifiers on the given network.
    * @returns {SecpKeyId}
    */
    keyId() {
        const ret = wasm.bip44publickey_keyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44publickey_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the account index.
    */
    get account() {
        const ret = wasm.bip44publickey_account(this.ptr);
        return ret;
    }
    /**
    * Accessor for whether the sub-account is for change addresses.
    */
    get change() {
        const ret = wasm.bip44publickey_change(this.ptr);
        return ret !== 0;
    }
    /**
    * Accessor for the key index within the sub-account.
    */
    get key() {
        const ret = wasm.bip44publickey_key(this.ptr);
        return ret;
    }
    /**
    * Accessor for the BIP32 path of the sub-account.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publickey_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns the P2PKH address that belongs key with the version byte of the network.
    */
    get address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publickey_to_p2pkh_addr(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Public API for a sub-account of a given account on a given coin that is either used for external keys (receiving addresses) or
* internal keys (change addresses). Some implementations do not distinguish these and just always use receiving
* addresses.
*/
export class Bip44PublicSubAccount {

    static __wrap(ptr) {
        const obj = Object.create(Bip44PublicSubAccount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44publicsubaccount_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32PublicNode}.
    * @returns {Bip32PublicNode}
    */
    node() {
        const ret = wasm.bip44publicsubaccount_node(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicsubaccount_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates a key with a given index used on the chain for storing balance or
    * authenticating actions.
    * @param {number} idx
    * @returns {Bip44PublicKey}
    */
    key(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicsubaccount_key(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44PublicKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44publicsubaccount_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the account index.
    */
    get account() {
        const ret = wasm.bip44publicsubaccount_account(this.ptr);
        return ret;
    }
    /**
    * Accessor for whether the sub-account is for change addresses.
    */
    get change() {
        const ret = wasm.bip44publicsubaccount_change(this.ptr);
        return ret !== 0;
    }
    /**
    * Accessor for the BIP32 path of the sub-account.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicsubaccount_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Recreates the public API of a BIP44 sub-account from its parts
    * @param {number} account
    * @param {boolean} change
    * @param {string} xpub
    * @param {string} network
    * @returns {Bip44PublicSubAccount}
    */
    static fromXpub(account, change, xpub, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(xpub, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.bip44publicsubaccount_fromXpub(retptr, account, change, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44PublicSubAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the extended public key in the BIP32 readable format with the version bytes of the network.
    */
    get xpub() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44publicsubaccount_to_xpub(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Private API for a sub-account of a given account on a given coin that is either used for external keys (receiving addresses) or
* internal keys (change addresses). Some implementations do not distinguish these and just always use receiving
* addresses.
*/
export class Bip44SubAccount {

    static __wrap(ptr) {
        const obj = Object.create(Bip44SubAccount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip44subaccount_free(ptr);
    }
    /**
    * Returns the underlying {@link Bip32Node}.
    * @returns {Bip32Node}
    */
    node() {
        const ret = wasm.bip44subaccount_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * Accessor for the name of the underlying network.
    */
    get network() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44subaccount_network(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates a key with a given index used on the chain for storing balance or
    * authenticating actions.
    * @param {number} idx
    * @returns {Bip44Key}
    */
    key(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44subaccount_key(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44Key.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * The coin identifier of the coin, defined in [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
    */
    get slip44() {
        const ret = wasm.bip44subaccount_slip44(this.ptr);
        return ret;
    }
    /**
    * Accessor for the account index.
    */
    get account() {
        const ret = wasm.bip44subaccount_account(this.ptr);
        return ret;
    }
    /**
    * Accessor for whether the sub-account is for change addresses.
    */
    get change() {
        const ret = wasm.bip44subaccount_change(this.ptr);
        return ret !== 0;
    }
    /**
    * Accessor for the BIP32 path of the sub-account.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44subaccount_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Neuters the sub-account and converts it into its public API
    * @returns {Bip44PublicSubAccount}
    */
    neuter() {
        const ret = wasm.bip44subaccount_neuter(this.ptr);
        return Bip44PublicSubAccount.__wrap(ret);
    }
    /**
    * Recreates the private API of a BIP44 sub-account from its parts
    * @param {number} account
    * @param {boolean} change
    * @param {string} xprv
    * @param {string} network
    * @returns {Bip44SubAccount}
    */
    static fromXprv(account, change, xprv, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(xprv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.bip44subaccount_fromXprv(retptr, account, change, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Bip44SubAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the extended private key in the BIP32 readable format with the version bytes of the network.
    */
    get xprv() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip44subaccount_to_xprv(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class CoeusAsset {

    static __wrap(ptr) {
        const obj = Object.create(CoeusAsset.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_coeusasset_free(ptr);
    }
    /**
    * @param {any} data
    */
    constructor(data) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusasset_new(retptr, addBorrowedObject(data));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return CoeusAsset.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {CoeusAsset}
    */
    static deserialize(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.coeusasset_deserialize(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return CoeusAsset.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    serialize() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusasset_serialize(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {bigint}
    */
    fee() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusasset_fee(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    toJSON() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusasset_toJSON(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class CoeusState {

    static __wrap(ptr) {
        const obj = Object.create(CoeusState.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_coeusstate_free(ptr);
    }
    /**
    */
    constructor() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusstate_new(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return CoeusState.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {DomainName} name
    * @returns {any}
    */
    resolveData(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(name, DomainName);
            wasm.coeusstate_resolveData(retptr, this.ptr, name.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {DomainName} name
    * @returns {any}
    */
    getMetadata(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(name, DomainName);
            wasm.coeusstate_getMetadata(retptr, this.ptr, name.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {DomainName} name
    * @returns {any}
    */
    getChildren(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(name, DomainName);
            wasm.coeusstate_getChildren(retptr, this.ptr, name.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {PublicKey} pk
    * @returns {bigint}
    */
    lastNonce(pk) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(pk, PublicKey);
            wasm.coeusstate_lastNonce(retptr, this.ptr, pk.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} txid
    * @param {CoeusAsset} asset
    */
    applyTransaction(txid, asset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(asset, CoeusAsset);
            wasm.coeusstate_applyTransaction(retptr, this.ptr, ptr0, len0, asset.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} txid
    * @param {CoeusAsset} asset
    */
    revertTransaction(txid, asset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(asset, CoeusAsset);
            wasm.coeusstate_revertTransaction(retptr, this.ptr, ptr0, len0, asset.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} height
    */
    blockApplying(height) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusstate_blockApplying(retptr, this.ptr, height);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} height
    */
    blockReverted(height) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusstate_blockReverted(retptr, this.ptr, height);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    get corrupted() {
        const ret = wasm.coeusstate_is_corrupted(this.ptr);
        return ret !== 0;
    }
    /**
    */
    get version() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coeusstate_version(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    get lastSeenHeight() {
        const ret = wasm.coeusstate_last_seen_height(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {string} txid
    * @returns {boolean}
    */
    getTxnStatus(txid) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.coeusstate_getTxnStatus(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class CoeusTxBuilder {

    static __wrap(ptr) {
        const obj = Object.create(CoeusTxBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_coeustxbuilder_free(ptr);
    }
    /**
    * @param {string} network_name
    */
    constructor(network_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(network_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.coeustxbuilder_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return CoeusTxBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {SignedBundle} ops
    * @param {SecpPublicKey} sender_pubkey
    * @param {bigint} nonce
    * @returns {any}
    */
    build(ops, sender_pubkey, nonce) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(ops, SignedBundle);
            _assertClass(sender_pubkey, SecpPublicKey);
            uint64CvtShim[0] = nonce;
            const low0 = u32CvtShim[0];
            const high0 = u32CvtShim[1];
            wasm.coeustxbuilder_build(retptr, this.ptr, ops.ptr, sender_pubkey.ptr, low0, high0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* An object representing a valid DID. This identifier can be used to look up a DID document
* on multiple blockchains. Without any on-chain SSI transactions, there will be a single
* key that can update and impersonate the DID, which has the default key identifier.
*
* @see defaultKeyId
*/
export class Did {

    static __wrap(ptr) {
        const obj = Object.create(Did.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_did_free(ptr);
    }
    /**
    * Try to parse a string into a DID
    * @param {string} did_str
    */
    constructor(did_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.did_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Did.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * All DID strings start with this prefix
    * @returns {string}
    */
    static prefix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.did_prefix(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates a DID from a multicipher {@KeyId}, so the default key identifier of the DID
    * will match that.
    *
    * @see defaultKeyId
    * @param {KeyId} key_id
    * @returns {Did}
    */
    static fromKeyId(key_id) {
        _assertClass(key_id, KeyId);
        const ret = wasm.did_fromKeyId(key_id.ptr);
        return Did.__wrap(ret);
    }
    /**
    * Returns the default key identifier for a DID that has update and impersonation rights
    * unless the DID document was modified on chain.
    * @returns {KeyId}
    */
    defaultKeyId() {
        const ret = wasm.did_defaultKeyId(this.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * Converts the DID into a string like `did:morpheus:ezBlah`
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.did_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class DidDocument {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_diddocument_free(ptr);
    }
}
/**
*/
export class DomainName {

    static __wrap(ptr) {
        const obj = Object.create(DomainName.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_domainname_free(ptr);
    }
    /**
    * @param {string} domain_name
    */
    constructor(domain_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.domainname_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return DomainName.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.domainname_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Builder object for creating and signing a JWT (JSON Web Token) with or without an associated content.
*
* @see JwtParser
*/
export class JwtBuilder {

    static __wrap(ptr) {
        const obj = Object.create(JwtBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jwtbuilder_free(ptr);
    }
    /**
    * Creates a new JWT without an associated content. The time of creation is set
    * in this call.
    */
    constructor() {
        const ret = wasm.jwtbuilder_new();
        return JwtBuilder.__wrap(ret);
    }
    /**
    * Creates a new JWT without an associated content. The time of creation is set
    * in this call.
    * @param {string} content_id
    * @returns {JwtBuilder}
    */
    static withContentId(content_id) {
        const ptr0 = passStringToWasm0(content_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jwtbuilder_withContentId(ptr0, len0);
        return JwtBuilder.__wrap(ret);
    }
    /**
    * Gets how long the token is valid. (5 seconds by default)
    */
    get timeToLive() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jwtbuilder_timeToLive(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = int64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets how long the token is valid.
    */
    set timeToLive(seconds) {
        int64CvtShim[0] = seconds;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.jwtbuilder_set_timeToLive(this.ptr, low0, high0);
    }
    /**
    * Signs and serializes the token with the given multicipher {@link PrivateKey}
    * @param {PrivateKey} sk
    * @returns {string}
    */
    sign(sk) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(sk, PrivateKey);
            wasm.jwtbuilder_sign(retptr, this.ptr, sk.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
}
/**
* Parser for reading a JWT (JSON Web Token) from a string and validate its content and signature.
*/
export class JwtParser {

    static __wrap(ptr) {
        const obj = Object.create(JwtParser.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jwtparser_free(ptr);
    }
    /**
    * Parse JWT from a string created with {@link JwtBuilder}
    * @param {string} token
    */
    constructor(token) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(token, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.jwtparser_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return JwtParser.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the public key that signed the token
    */
    get publicKey() {
        const ret = wasm.jwtparser_public_key(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * Returns the UTC date-time instance the token was created
    */
    get createdAt() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jwtparser_created_at(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = int64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns how long the token stays valid
    */
    get timeToLive() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jwtparser_time_to_live(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = int64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* Multicipher key id (fingerprint/digest/hash of a public key)
*
* In some algorithms the public key is only revealed in point-to-point
* communications and a keypair is identified only by the digest of the public
* key in all other channels.
*/
export class KeyId {

    static __wrap(ptr) {
        const obj = Object.create(KeyId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_keyid_free(ptr);
    }
    /**
    * Parses a string into a {@link KeyId}.
    * @param {string} key_id_str
    */
    constructor(key_id_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key_id_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.keyid_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return KeyId.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Converts a {@link SecpKeyId} into a multicipher {@link KeyId}.
    * @param {SecpKeyId} secp
    * @returns {KeyId}
    */
    static fromSecp(secp) {
        _assertClass(secp, SecpKeyId);
        const ret = wasm.keyid_fromSecp(secp.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * All multicipher key ids start with this prefix
    * @returns {string}
    */
    static prefix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.keyid_prefix(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Converts a {@link KeyId} into a string.
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.keyid_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Starting point for deriving all Morpheus related keys in a BIP32 hierarchy. Morpheus uses Ed25519 cipher and currently there are no
* WASM wrappers for Bip32 nodes with that cipher. Still, Bip32 paths are returned by each object so compatible wallets can derive the
* same extended private keys.
*/
export class Morpheus {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_morpheus_free(ptr);
    }
    /**
    * Calculate the root node of the Morpheus subtree in the HD wallet defined by a seed.
    * @param {Seed} seed
    * @returns {MorpheusRoot}
    */
    static root(seed) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(seed, Seed);
            wasm.morpheus_root(retptr, seed.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusRoot.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* Root node of a specific kind of DIDs. The kind used to derive a DID is indistiguishable outside the wallet.
*/
export class MorpheusKind {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusKind.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_morpheuskind_free(ptr);
    }
    /**
    * Accessor for the BIP32 path of the morpheus subtree for a DID kind.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheuskind_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Accessor for the kind of DIDs in this subtree
    */
    get kind() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheuskind_kind(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Creates a {@link MorpheusPrivateKey} with the given index under this subtree.
    * E.g. 5th persona, 3rd device, or 0th group, etc.
    * @param {number} idx
    * @returns {MorpheusPrivateKey}
    */
    key(idx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheuskind_key(retptr, this.ptr, idx);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusPrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* The operations on an identifier that require the private key to be available in memory.
*/
export class MorpheusPrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_morpheusprivatekey_free(ptr);
    }
    /**
    * Accessor for the BIP32 path of the morpheus key.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusprivatekey_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Accessor for the kind of DIDs in this subtree
    */
    get kind() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusprivatekey_kind(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Index of the key in its subtree.
    */
    get idx() {
        const ret = wasm.morpheusprivatekey_idx(this.ptr);
        return ret;
    }
    /**
    * Creates the public interface of the node that does not need the private key in memory.
    * @returns {MorpheusPublicKey}
    */
    neuter() {
        const ret = wasm.morpheusprivatekey_neuter(this.ptr);
        return MorpheusPublicKey.__wrap(ret);
    }
    /**
    * Returns the multicipher {@link PrivateKey} that belongs to this key.
    * @returns {PrivateKey}
    */
    privateKey() {
        const ret = wasm.morpheusprivatekey_privateKey(this.ptr);
        return PrivateKey.__wrap(ret);
    }
}
/**
* The operations on an identifier that do not require the private key to be available in memory.
*/
export class MorpheusPublicKey {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_morpheuspublickey_free(ptr);
    }
    /**
    * Accessor for the BIP32 path of the morpheus key.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheuspublickey_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Accessor for the kind of DIDs in this subtree
    */
    get kind() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheuspublickey_kind(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Index of the key in its subtree.
    */
    get idx() {
        const ret = wasm.morpheuspublickey_idx(this.ptr);
        return ret;
    }
    /**
    * Returns the multicipher {@link PublicKey} that belongs to this key.
    * @returns {PublicKey}
    */
    publicKey() {
        const ret = wasm.morpheuspublickey_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
}
/**
* Representation of the root node of the Morpheus subtree in the HD wallet.
*/
export class MorpheusRoot {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusRoot.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_morpheusroot_free(ptr);
    }
    /**
    * Accessor for the BIP32 path of the morpheus root.
    */
    get path() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusroot_bip32_path(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Derive a separate HD wallet subtree of the given DID kind. Use 'persona', 'device', 'group' or 'resource' in
    * singular as a parameter.
    * @param {string} did_kind
    * @returns {MorpheusKind}
    */
    kind(did_kind) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusroot_kind(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusKind.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Alias for kind('persona')
    * @returns {MorpheusKind}
    */
    personas() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusroot_personas(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusKind.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Alias for kind('device')
    * @returns {MorpheusKind}
    */
    devices() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusroot_devices(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusKind.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Alias for kind('group')
    * @returns {MorpheusKind}
    */
    groups() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusroot_groups(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusKind.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Alias for kind('resource')
    * @returns {MorpheusKind}
    */
    resources() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusroot_resources(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusKind.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class MorpheusState {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusState.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_morpheusstate_free(ptr);
    }
    /**
    */
    constructor() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusstate_new(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MorpheusState.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    get corrupted() {
        const ret = wasm.morpheusstate_is_corrupted(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {number}
    */
    lastBlockHeight() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusstate_lastBlockHeight(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} txid
    * @returns {boolean | undefined}
    */
    isConfirmed(txid) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_isConfirmed(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 === 0xFFFFFF ? undefined : r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} content_id
    * @param {number | undefined} height_opt
    * @returns {boolean}
    */
    beforeProofExistsAt(content_id, height_opt) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(content_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_beforeProofExistsAt(retptr, this.ptr, ptr0, len0, !isLikeNone(height_opt), isLikeNone(height_opt) ? 0 : height_opt);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} content_id
    * @returns {any}
    */
    beforeProofHistory(content_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(content_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_beforeProofHistory(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} did
    * @param {boolean} include_attempts
    * @param {number} from_height_inc
    * @param {number | undefined} until_height_inc
    * @returns {any}
    */
    getTransactionHistory(did, include_attempts, from_height_inc, until_height_inc) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_getTransactionHistory(retptr, this.ptr, ptr0, len0, include_attempts, from_height_inc, !isLikeNone(until_height_inc), isLikeNone(until_height_inc) ? 0 : until_height_inc);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} did
    * @returns {string | undefined}
    */
    lastTxId(did) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_lastTxId(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} did_data
    * @param {number | undefined} height_opt
    * @returns {any}
    */
    getDidDocumentAt(did_data, height_opt) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did_data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_getDidDocumentAt(retptr, this.ptr, ptr0, len0, !isLikeNone(height_opt), isLikeNone(height_opt) ? 0 : height_opt);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {any} asset
    * @returns {any[]}
    */
    dryRun(asset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusstate_dryRun(retptr, this.ptr, addBorrowedObject(asset));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {number} height
    */
    blockApplying(height) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusstate_blockApplying(retptr, this.ptr, height);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} txid
    * @param {any} asset
    */
    applyTransaction(txid, asset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_applyTransaction(retptr, this.ptr, ptr0, len0, addBorrowedObject(asset));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {number} height
    */
    blockReverting(height) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.morpheusstate_blockReverting(retptr, this.ptr, height);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} txid
    * @param {any} asset
    */
    revertTransaction(txid, asset) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.morpheusstate_revertTransaction(retptr, this.ptr, ptr0, len0, addBorrowedObject(asset));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
}
/**
*/
export class NoncedBundle {

    static __wrap(ptr) {
        const obj = Object.create(NoncedBundle.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_noncedbundle_free(ptr);
    }
    /**
    * @returns {Price}
    */
    price() {
        const ret = wasm.noncedbundle_price(this.ptr);
        return Price.__wrap(ret);
    }
    /**
    * @param {PrivateKey} sk
    * @returns {SignedBundle}
    */
    sign(sk) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(sk, PrivateKey);
            wasm.noncedbundle_sign(retptr, ptr, sk.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SignedBundle.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    serialize() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.noncedbundle_serialize(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
}
/**
*/
export class NoncedBundleBuilder {

    static __wrap(ptr) {
        const obj = Object.create(NoncedBundleBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_noncedbundlebuilder_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.noncedbundlebuilder_new();
        return NoncedBundleBuilder.__wrap(ret);
    }
    /**
    * @param {UserOperation} user_operation
    */
    add(user_operation) {
        _assertClass(user_operation, UserOperation);
        wasm.noncedbundlebuilder_add(this.ptr, user_operation.ptr);
    }
    /**
    * @param {bigint} nonce
    * @returns {NoncedBundle}
    */
    build(nonce) {
        uint64CvtShim[0] = nonce;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        const ret = wasm.noncedbundlebuilder_build(this.ptr, low0, high0);
        return NoncedBundle.__wrap(ret);
    }
}
/**
*/
export class Price {

    static __wrap(ptr) {
        const obj = Object.create(Price.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_price_free(ptr);
    }
    /**
    */
    get fee() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.price_fee(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Principal {

    static __wrap(ptr) {
        const obj = Object.create(Principal.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_principal_free(ptr);
    }
    /**
    * @returns {Principal}
    */
    static system() {
        const ret = wasm.principal_system();
        return Principal.__wrap(ret);
    }
    /**
    * @param {PublicKey} pk
    * @returns {Principal}
    */
    static publicKey(pk) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(pk, PublicKey);
            wasm.principal_publicKey(retptr, pk.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Principal.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {PublicKey} pk
    */
    validateImpersonation(pk) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(pk, PublicKey);
            wasm.principal_validateImpersonation(retptr, this.ptr, pk.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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

    static __wrap(ptr) {
        const obj = Object.create(PrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_privatekey_free(ptr);
    }
    /**
    * Converts a {@link SecpPrivateKey} into a multicipher {@link PrivateKey}.
    * @param {SecpPrivateKey} sk
    * @returns {PrivateKey}
    */
    static fromSecp(sk) {
        _assertClass(sk, SecpPrivateKey);
        const ret = wasm.privatekey_fromSecp(sk.ptr);
        return PrivateKey.__wrap(ret);
    }
    /**
    * Calculates the public key the belongs to this private key.
    * @returns {PublicKey}
    */
    publicKey() {
        const ret = wasm.privatekey_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * Calculates the signature of a message that can be then verified using {@link PublicKey.validate_ecdsa}
    * @param {Uint8Array} data
    * @returns {Signature}
    */
    signEcdsa(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.privatekey_signEcdsa(this.ptr, ptr0, len0);
        return Signature.__wrap(ret);
    }
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

    static __wrap(ptr) {
        const obj = Object.create(PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickey_free(ptr);
    }
    /**
    * Parses a string into a {@link PublicKey}.
    * @param {string} pub_key_str
    */
    constructor(pub_key_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pub_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.publickey_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return PublicKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Converts a {@link SecpPublicKey} into a multicipher {@link PublicKey}.
    * @param {SecpPublicKey} pk
    * @returns {PublicKey}
    */
    static fromSecp(pk) {
        _assertClass(pk, SecpPublicKey);
        const ret = wasm.publickey_fromSecp(pk.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * All multicipher public keys start with this prefix
    * @returns {string}
    */
    static prefix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.publickey_prefix(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Calculates the key id (also called fingerprint or address in some
    * literature) of the public key.
    * @returns {KeyId}
    */
    keyId() {
        const ret = wasm.publickey_keyId(this.ptr);
        return KeyId.__wrap(ret);
    }
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
    validateId(key_id) {
        _assertClass(key_id, KeyId);
        const ret = wasm.publickey_validateId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * This method can be used to verify if a given signature for a message was
    * made using the private key that belongs to this public key.
    *
    * @see PrivateKey.sign
    * @param {Uint8Array} data
    * @param {Signature} signature
    * @returns {boolean}
    */
    validateEcdsa(data, signature) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Signature);
        const ret = wasm.publickey_validateEcdsa(this.ptr, ptr0, len0, signature.ptr);
        return ret !== 0;
    }
    /**
    * Converts a {@link PublicKey} into a string.
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.publickey_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Secp256k1 key id (fingerprint/digest/hash of a public key)
*/
export class SecpKeyId {

    static __wrap(ptr) {
        const obj = Object.create(SecpKeyId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secpkeyid_free(ptr);
    }
    /**
    * Deserializes the key identifier from a `p2pkh` bitcoin address
    * @param {string} address
    * @param {string} network
    * @returns {SecpKeyId}
    */
    static fromAddress(address, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.secpkeyid_fromAddress(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SecpKeyId.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Serializes the key identifier as a `p2pkh` bitcoin address
    * @param {string} network
    * @returns {string}
    */
    toAddress(network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secpkeyid_toAddress(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
}
/**
* Secp256k1 private key
*/
export class SecpPrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(SecpPrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secpprivatekey_free(ptr);
    }
    /**
    * Creates a {@link SecpPrivateKey} from a passphrase compatible with ark.io wallets.
    *
    * An Ark passphrase is a secret that must not be kept unencrypted in transit or in rest!
    * @param {string} phrase
    * @returns {SecpPrivateKey}
    */
    static fromArkPassphrase(phrase) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secpprivatekey_fromArkPassphrase(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SecpPrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a {@link SecpPrivateKey} from a WIF string compatible with BTC-related wallets. The
    * second argument is a network name, that {@link validateNetworkName} accepts.
    *
    * A WIF is a secret that must not be kept unencrypted in transit or in rest!
    * @param {string} wif
    * @param {string} network
    * @returns {SecpPrivateKey}
    */
    static fromWif(wif, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(wif, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.secpprivatekey_fromWif(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SecpPrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Creates a WIF string compatible with BTC-related wallets. The second argument is a
    * network name, that {@link validateNetworkName} accepts.
    *
    * This is a secret that must not be kept unencrypted in transit or in rest!
    * @param {string} network
    * @returns {string}
    */
    toWif(network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secpprivatekey_toWif(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * Calculates the public key the belongs to this private key.
    * @returns {SecpPublicKey}
    */
    publicKey() {
        const ret = wasm.secpprivatekey_publicKey(this.ptr);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * Calculates the signature of a message that can be then verified using {@link SecpPublicKey.validate_ecdsa}
    * @param {Uint8Array} data
    * @returns {SecpSignature}
    */
    signEcdsa(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.secpprivatekey_signEcdsa(this.ptr, ptr0, len0);
        return SecpSignature.__wrap(ret);
    }
}
/**
* Secp256k1 public key
*/
export class SecpPublicKey {

    static __wrap(ptr) {
        const obj = Object.create(SecpPublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secppublickey_free(ptr);
    }
    /**
    * Parses a string into a {@link SecpPublicKey}.
    * @param {string} key
    */
    constructor(key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secppublickey_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SecpPublicKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Calculates the key id (also called fingerprint or address in some
    * literature) of the public key.
    * @returns {SecpKeyId}
    */
    keyId() {
        const ret = wasm.secppublickey_keyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * Calculates the key id of the public key the non-standard way ark.io and
    * therefore Hydra uses.
    *
    * Regular bitcoin-based chains use the ripemd160 hash of the sha2-256 hash
    * of the public key, but ARK only uses ripemd160.
    * @returns {SecpKeyId}
    */
    arkKeyId() {
        const ret = wasm.secppublickey_arkKeyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * Validates if `key_id` belongs to this public key
    * @param {SecpKeyId} key_id
    * @returns {boolean}
    */
    validateId(key_id) {
        _assertClass(key_id, SecpKeyId);
        const ret = wasm.secppublickey_validateId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * Validates if `key_id` belongs to this public key if it was generated
    * the ark.io way.
    * @param {SecpKeyId} key_id
    * @returns {boolean}
    */
    validateArkId(key_id) {
        _assertClass(key_id, SecpKeyId);
        const ret = wasm.secppublickey_validateArkId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * This method can be used to verify if a given signature for a message was
    * made using the private key that belongs to this public key.
    * @param {Uint8Array} data
    * @param {SecpSignature} signature
    * @returns {boolean}
    */
    validateEcdsa(data, signature) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(signature, SecpSignature);
        const ret = wasm.secppublickey_validateEcdsa(this.ptr, ptr0, len0, signature.ptr);
        return ret !== 0;
    }
    /**
    * Converts a {@link SecpPublicKey} into a string.
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.secppublickey_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Secp256k1 signature
*/
export class SecpSignature {

    static __wrap(ptr) {
        const obj = Object.create(SecpSignature.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secpsignature_free(ptr);
    }
    /**
    * Deserializes an ASN.1 DER encoded buffer into a {@link SepcSignature}
    * @param {Uint8Array} bytes
    * @returns {SecpSignature}
    */
    static fromDer(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secpsignature_fromDer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SecpSignature.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Serializes a {@link SepcSignature} into an ASN.1 DER encoded buffer
    * @returns {Uint8Array}
    */
    toDer() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.secpsignature_toDer(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Converts a {@link SecpSignature} into a string.
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.secpsignature_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* The seed used for BIP32 derivations. A seed cannot be turned back into a
* phrase, because there is salted hashing involed in creating it from the
* BIP39 mnemonic phrase.
*/
export class Seed {

    static __wrap(ptr) {
        const obj = Object.create(Seed.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_seed_free(ptr);
    }
    /**
    * Creates seed from a raw 512-bit binary seed
    * @param {Uint8Array} bytes
    */
    constructor(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.seed_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Seed.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * A BIP39 phrase we use in most of the demo videos and proof-of-concept
    * applications. Do not use it in production code.
    * @returns {string}
    */
    static demoPhrase() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.seed_demoPhrase(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Legacy password used in the 0.0.1 version of the crate. Since 0.0.2 the
    * crate always requires a password, which should be "" by default when
    * the user does not provide one. (BIP39 standard for "25th word")
    * @returns {string}
    */
    static legacyPassword() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.seed_legacyPassword(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Returns the 512-bit binary representation of the seed
    * @returns {Uint8Array}
    */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.seed_toBytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* Multicipher signature
*/
export class Signature {

    static __wrap(ptr) {
        const obj = Object.create(Signature.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signature_free(ptr);
    }
    /**
    * Parses a string into a {@link Signature}.
    * @param {string} sign_str
    */
    constructor(sign_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(sign_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.signature_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Signature.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Converts a {@link SecpSignature} into a multicipher {@link Signature}.
    * @param {SecpSignature} secp
    * @returns {Signature}
    */
    static fromSecp(secp) {
        _assertClass(secp, SecpSignature);
        const ret = wasm.signature_fromSecp(secp.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * All multicipher signatures start with this prefix
    * @returns {string}
    */
    static prefix() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_prefix(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Converts a {@link Signature} into a string.
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class SignedBundle {

    static __wrap(ptr) {
        const obj = Object.create(SignedBundle.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signedbundle_free(ptr);
    }
    /**
    * @param {any} data
    */
    constructor(data) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedbundle_new(retptr, addBorrowedObject(data));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SignedBundle.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @returns {Price}
    */
    price() {
        const ret = wasm.signedbundle_price(this.ptr);
        return Price.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    verify() {
        const ret = wasm.signedbundle_verify(this.ptr);
        return ret !== 0;
    }
}
/**
* Binary data signed by a multicipher key.
*/
export class SignedBytes {

    static __wrap(ptr) {
        const obj = Object.create(SignedBytes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signedbytes_free(ptr);
    }
    /**
    * Create {@link SignedBytes} from its parts.
    * @param {PublicKey} public_key
    * @param {Uint8Array} content
    * @param {Signature} signature
    */
    constructor(public_key, content, signature) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(public_key, PublicKey);
            const ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(signature, Signature);
            wasm.signedbytes_new(retptr, public_key.ptr, ptr0, len0, signature.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SignedBytes.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Accessor of the {@link PublicKey} that signed the binary data.
    */
    get publicKey() {
        const ret = wasm.signedbytes_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * Accessor of the binary data.
    */
    get content() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedbytes_content(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Accessor of the {@link Signature}.
    */
    get signature() {
        const ret = wasm.signedbytes_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * Verify if {@link signature} was made by the private key that belongs to {@link publicKey} on the {@link content}.
    * @returns {boolean}
    */
    validate() {
        const ret = wasm.signedbytes_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * Not only validate the signature, but also check if the provided {@link KeyId} was made from {@link publicKey}.
    *
    * @see validate
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithKeyId(signer_id) {
        _assertClass(signer_id, KeyId);
        const ret = wasm.signedbytes_validateWithKeyId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
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
    validateWithDidDoc(did_doc_str, from_height_inc, until_height_exc) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did_doc_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.signedbytes_validateWithDidDoc(retptr, this.ptr, ptr0, len0, !isLikeNone(from_height_inc), isLikeNone(from_height_inc) ? 0 : from_height_inc, !isLikeNone(until_height_exc), isLikeNone(until_height_exc) ? 0 : until_height_exc);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* JSON signed by a multicipher key. Since the signature is done on a digest created by {@link digestJson}, the same signature can be
* validated against different selectively revealed JSON documents.
*
* @see selectiveDigestJson
*/
export class SignedJson {

    static __wrap(ptr) {
        const obj = Object.create(SignedJson.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signedjson_free(ptr);
    }
    /**
    * Create {@link SignedJson} from its parts.
    * @param {PublicKey} public_key
    * @param {any} content
    * @param {Signature} signature
    */
    constructor(public_key, content, signature) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(public_key, PublicKey);
            _assertClass(signature, Signature);
            wasm.signedjson_new(retptr, public_key.ptr, addBorrowedObject(content), signature.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SignedJson.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * Accessor of the {@link PublicKey} that signed the binary data.
    */
    get publicKey() {
        const ret = wasm.signedjson_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * Accessor of the JSON content.
    */
    get content() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedjson_content(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Accessor of the {@link Signature}.
    */
    get signature() {
        const ret = wasm.signedjson_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * Verify if {@link signature} was made by the private key that belongs to {@link publicKey} on the {@link content}.
    * @returns {boolean}
    */
    validate() {
        const ret = wasm.signedjson_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * Not only validate the signature, but also check if the provided {@link KeyId} was made from {@link publicKey}.
    *
    * @see validate
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithKeyId(signer_id) {
        _assertClass(signer_id, KeyId);
        const ret = wasm.signedjson_validateWithKeyId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
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
    validateWithDidDoc(did_doc_str, from_height_inc, until_height_exc) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(did_doc_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.signedjson_validateWithDidDoc(retptr, this.ptr, ptr0, len0, !isLikeNone(from_height_inc), isLikeNone(from_height_inc) ? 0 : from_height_inc, !isLikeNone(until_height_exc), isLikeNone(until_height_exc) ? 0 : until_height_exc);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Serialize this object as a JSON in a format used by IOP SSI in several places
    * @returns {any}
    */
    toJSON() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedjson_toJSON(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Deserialize a {@SignedJson} from a JSON in a format used by IOP SSI in several places
    * @param {any} json
    * @returns {SignedJson}
    */
    static fromJSON(json) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedjson_fromJSON(retptr, addBorrowedObject(json));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SignedJson.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
}
/**
*/
export class SubtreePolicies {

    static __wrap(ptr) {
        const obj = Object.create(SubtreePolicies.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subtreepolicies_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.subtreepolicies_new();
        return SubtreePolicies.__wrap(ret);
    }
    /**
    * @param {any} schema
    * @returns {SubtreePolicies}
    */
    withSchema(schema) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subtreepolicies_withSchema(retptr, this.ptr, addBorrowedObject(schema));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return SubtreePolicies.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {number} max_block_count
    * @returns {SubtreePolicies}
    */
    withExpiration(max_block_count) {
        const ret = wasm.subtreepolicies_withExpiration(this.ptr, max_block_count);
        return SubtreePolicies.__wrap(ret);
    }
}
/**
*/
export class UserOperation {

    static __wrap(ptr) {
        const obj = Object.create(UserOperation.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_useroperation_free(ptr);
    }
    /**
    * @param {DomainName} name
    * @param {Principal} owner
    * @param {SubtreePolicies} subtree_policies
    * @param {any} data
    * @param {number} expires_at_height
    * @returns {UserOperation}
    */
    static register(name, owner, subtree_policies, data, expires_at_height) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(name, DomainName);
            _assertClass(owner, Principal);
            _assertClass(subtree_policies, SubtreePolicies);
            wasm.useroperation_register(retptr, name.ptr, owner.ptr, subtree_policies.ptr, addBorrowedObject(data), expires_at_height);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UserOperation.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {DomainName} name
    * @param {any} data
    * @returns {UserOperation}
    */
    static update(name, data) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(name, DomainName);
            wasm.useroperation_update(retptr, name.ptr, addBorrowedObject(data));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UserOperation.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {DomainName} name
    * @param {number} expires_at_height
    * @returns {UserOperation}
    */
    static renew(name, expires_at_height) {
        _assertClass(name, DomainName);
        const ret = wasm.useroperation_renew(name.ptr, expires_at_height);
        return UserOperation.__wrap(ret);
    }
    /**
    * @param {DomainName} name
    * @param {Principal} to_owner
    * @returns {UserOperation}
    */
    static transfer(name, to_owner) {
        _assertClass(name, DomainName);
        _assertClass(to_owner, Principal);
        const ret = wasm.useroperation_transfer(name.ptr, to_owner.ptr);
        return UserOperation.__wrap(ret);
    }
    /**
    * @param {DomainName} name
    * @returns {UserOperation}
    */
    static delete(name) {
        _assertClass(name, DomainName);
        const ret = wasm.useroperation_delete(name.ptr);
        return UserOperation.__wrap(ret);
    }
}
/**
* A single issue found while validating against a DID document.
*
* @see SignedBytes.validateWithDidDoc, SignedJson.validateWithDidDoc
*/
export class ValidationIssue {

    static __wrap(ptr) {
        const obj = Object.create(ValidationIssue.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_validationissue_free(ptr);
    }
    /**
    * Error code of the issue
    */
    get code() {
        const ret = wasm.validationissue_code(this.ptr);
        return ret >>> 0;
    }
    /**
    * Severity of the issue ('warning' or 'error')
    */
    get severity() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.validationissue_severity(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Description of the issue as a string
    */
    get reason() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.validationissue_reason(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* All issues found while validating against a DID document.
*
* @see SignedBytes.validateWithDidDoc, SignedJson.validateWithDidDoc
*/
export class ValidationResult {

    static __wrap(ptr) {
        const obj = Object.create(ValidationResult.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_validationresult_free(ptr);
    }
    /**
    * Status of the validation based on the highest severity found among the issues ('invalid', 'maybe valid' or 'valid')
    */
    get status() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.validationresult_status(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * An array of all issues. Treat each item as a {@link ValidationIssue}.
    */
    get messages() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.validationresult_messages(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_json_parse(arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_json_serialize(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_validationissue_new(arg0) {
    const ret = ValidationIssue.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_validationresult_new(arg0) {
    const ret = ValidationResult.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_process_e56fd54cf6319b6c(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_versions_77e21455908dad33(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_0dd25d832e4785d5(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_require_0db1598d9ccecb30() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_crypto_b95d7173266618a9(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_msCrypto_5a86d77a66230f81(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_getRandomValues_b14734aa289bc356() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_static_accessor_NODE_MODULE_26b231378c1be7dd() {
    const ret = module;
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_91e2b39becca6147() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_newnoargs_fc5356289219b93b(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_4573f605ca4b5f10() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_self_ba1ddafe9ea7a3a2() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_be3cc430364fd32c() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_56d9c9f814daeeee() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_8c35aeee4ac77f2b() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_getTime_7c8d3b79f51e2b87(arg0) {
    const ret = getObject(arg0).getTime();
    return ret;
};

export function __wbg_new0_6b49a1fca8534d39() {
    const ret = new Date();
    return addHeapObject(ret);
};

export function __wbg_buffer_de1150f91b23aa89(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_new_97cf52648830a70d(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_a0172b213e2469e9(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_e09c0b925ab8de5d(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithlength_e833b89f9db02732(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_9482ae5cd5cd99d3(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);

