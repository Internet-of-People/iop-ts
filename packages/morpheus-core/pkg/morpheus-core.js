let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder } = require(String.raw`util`);

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

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

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let WASM_VECTOR_LEN = 0;

let cachegetNodeBufferMemory0 = null;
function getNodeBufferMemory0() {
    if (cachegetNodeBufferMemory0 === null || cachegetNodeBufferMemory0.buffer !== wasm.memory.buffer) {
        cachegetNodeBufferMemory0 = Buffer.from(wasm.memory.buffer);
    }
    return cachegetNodeBufferMemory0;
}

function passStringToWasm0(arg, malloc) {

    const len = Buffer.byteLength(arg);
    const ptr = malloc(len);
    getNodeBufferMemory0().write(arg, ptr, len);
    WASM_VECTOR_LEN = len;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
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

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
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
/**
*/
class KeyId {

    static __wrap(ptr) {
        const obj = Object.create(KeyId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_keyid_free(ptr);
    }
    /**
    * @param {string} key_id_str
    */
    constructor(key_id_str) {
        var ptr0 = passStringToWasm0(key_id_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.keyid_new(ptr0, len0);
        return KeyId.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        try {
            wasm.keyid_prefix(8);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            wasm.keyid_toString(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.KeyId = KeyId;
/**
*/
class PublicKey {

    static __wrap(ptr) {
        const obj = Object.create(PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_publickey_free(ptr);
    }
    /**
    * @param {string} pub_key_str
    */
    constructor(pub_key_str) {
        var ptr0 = passStringToWasm0(pub_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.publickey_new(ptr0, len0);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        try {
            wasm.publickey_prefix(8);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {KeyId}
    */
    keyId() {
        var ret = wasm.publickey_keyId(this.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * @param {KeyId} key_id
    * @returns {boolean}
    */
    validateId(key_id) {
        _assertClass(key_id, KeyId);
        var ret = wasm.publickey_validateId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            wasm.publickey_toString(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.PublicKey = PublicKey;
/**
*/
class Signature {

    static __wrap(ptr) {
        const obj = Object.create(Signature.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_signature_free(ptr);
    }
    /**
    * @param {string} sign_str
    */
    constructor(sign_str) {
        var ptr0 = passStringToWasm0(sign_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.signature_new(ptr0, len0);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        try {
            wasm.signature_prefix(8);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            wasm.signature_toString(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Signature = Signature;
/**
*/
class SignedMessage {

    static __wrap(ptr) {
        const obj = Object.create(SignedMessage.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_signedmessage_free(ptr);
    }
    /**
    * @param {PublicKey} public_key
    * @param {Uint8Array} message
    * @param {Signature} signature
    */
    constructor(public_key, message, signature) {
        _assertClass(public_key, PublicKey);
        var ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Signature);
        var ret = wasm.signedmessage_new(public_key.ptr, ptr0, len0, signature.ptr);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    get publicKey() {
        var ret = wasm.signedmessage_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    get message() {
        wasm.signedmessage_message(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    }
    /**
    * @returns {Signature}
    */
    get signature() {
        var ret = wasm.signedmessage_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    validate() {
        var ret = wasm.signedmessage_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithId(signer_id) {
        _assertClass(signer_id, KeyId);
        var ret = wasm.signedmessage_validateWithId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
}
module.exports.SignedMessage = SignedMessage;
/**
*/
class SignedString {

    static __wrap(ptr) {
        const obj = Object.create(SignedString.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_signedstring_free(ptr);
    }
    /**
    * @param {PublicKey} public_key
    * @param {string} content
    * @param {Signature} signature
    */
    constructor(public_key, content, signature) {
        _assertClass(public_key, PublicKey);
        var ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Signature);
        var ret = wasm.signedstring_new(public_key.ptr, ptr0, len0, signature.ptr);
        return SignedString.__wrap(ret);
    }
    /**
    * @param {SignedMessage} signed
    * @returns {SignedString}
    */
    static from(signed) {
        _assertClass(signed, SignedMessage);
        var ret = wasm.signedstring_from(signed.ptr);
        return SignedString.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    get publicKey() {
        var ret = wasm.signedstring_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get content() {
        try {
            wasm.signedstring_content(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Signature}
    */
    get signature() {
        var ret = wasm.signedstring_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    validate() {
        var ret = wasm.signedstring_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithKeyId(signer_id) {
        _assertClass(signer_id, KeyId);
        var ret = wasm.signedstring_validateWithKeyId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
    /**
    * @param {string} did_doc_str
    * @param {number | undefined} from_height_inc
    * @param {number | undefined} until_height_exc
    * @returns {boolean}
    */
    validateWithDid(did_doc_str, from_height_inc, until_height_exc) {
        var ptr0 = passStringToWasm0(did_doc_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.signedstring_validateWithDid(this.ptr, ptr0, len0, !isLikeNone(from_height_inc), isLikeNone(from_height_inc) ? 0 : from_height_inc, !isLikeNone(until_height_exc), isLikeNone(until_height_exc) ? 0 : until_height_exc);
        return ret !== 0;
    }
}
module.exports.SignedString = SignedString;
/**
*/
class Vault {

    static __wrap(ptr) {
        const obj = Object.create(Vault.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_vault_free(ptr);
    }
    /**
    * @param {string} seed_phrase
    */
    constructor(seed_phrase) {
        var ptr0 = passStringToWasm0(seed_phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vault_new(ptr0, len0);
        return Vault.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    serialize() {
        try {
            wasm.vault_serialize(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} from
    * @returns {Vault}
    */
    static deserialize(from) {
        var ptr0 = passStringToWasm0(from, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vault_deserialize(ptr0, len0);
        return Vault.__wrap(ret);
    }
    /**
    * @returns {any[]}
    */
    profiles() {
        wasm.vault_profiles(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4);
        return v0;
    }
    /**
    * @returns {KeyId | undefined}
    */
    activeId() {
        var ret = wasm.vault_activeId(this.ptr);
        return ret === 0 ? undefined : KeyId.__wrap(ret);
    }
    /**
    * @returns {KeyId}
    */
    createId() {
        var ret = wasm.vault_createId(this.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * @param {KeyId} key_id
    * @param {Uint8Array} message
    * @returns {SignedMessage}
    */
    sign(key_id, message) {
        _assertClass(key_id, KeyId);
        var ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vault_sign(this.ptr, key_id.ptr, ptr0, len0);
        return SignedMessage.__wrap(ret);
    }
}
module.exports.Vault = Vault;

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

const path = require('path').join(__dirname, 'morpheus-core_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

