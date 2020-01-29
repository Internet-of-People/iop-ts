let wasm;
const { TextDecoder } = require(String.raw`util`);

let WASM_VECTOR_LEN = 0;

let cachegetNodeBufferMemory = null;
function getNodeBufferMemory() {
    if (cachegetNodeBufferMemory === null || cachegetNodeBufferMemory.buffer !== wasm.memory.buffer) {
        cachegetNodeBufferMemory = Buffer.from(wasm.memory.buffer);
    }
    return cachegetNodeBufferMemory;
}

function passStringToWasm(arg) {

    const len = Buffer.byteLength(arg);
    const ptr = wasm.__wbindgen_malloc(len);
    getNodeBufferMemory().write(arg, ptr, len);
    WASM_VECTOR_LEN = len;
    return ptr;
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArray8ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);
    getUint8Memory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm(ptr, len) {
    return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory;
}

const heap = new Array(32);

heap.fill(undefined);

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

function getArrayJsValueFromWasm(ptr, len) {
    const mem = getUint32Memory();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
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
    * @returns {KeyId}
    */
    constructor(key_id_str) {
        const ret = wasm.keyid_new(passStringToWasm(key_id_str), WASM_VECTOR_LEN);
        return KeyId.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        const retptr = 8;
        const ret = wasm.keyid_prefix(retptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * @returns {string}
    */
    toString() {
        const retptr = 8;
        const ret = wasm.keyid_toString(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
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
    * @returns {PublicKey}
    */
    constructor(pub_key_str) {
        const ret = wasm.publickey_new(passStringToWasm(pub_key_str), WASM_VECTOR_LEN);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        const retptr = 8;
        const ret = wasm.publickey_prefix(retptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * @returns {KeyId}
    */
    keyId() {
        const ret = wasm.publickey_keyId(this.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * @param {KeyId} key_id
    * @returns {boolean}
    */
    validateId(key_id) {
        _assertClass(key_id, KeyId);
        const ret = wasm.publickey_validateId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    toString() {
        const retptr = 8;
        const ret = wasm.publickey_toString(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
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
    * @returns {Signature}
    */
    constructor(sign_str) {
        const ret = wasm.signature_new(passStringToWasm(sign_str), WASM_VECTOR_LEN);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        const retptr = 8;
        const ret = wasm.signature_prefix(retptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * @returns {string}
    */
    toString() {
        const retptr = 8;
        const ret = wasm.signature_toString(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
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
    * @returns {SignedMessage}
    */
    constructor(public_key, message, signature) {
        _assertClass(public_key, PublicKey);
        _assertClass(signature, Signature);
        const ret = wasm.signedmessage_new(public_key.ptr, passArray8ToWasm(message), WASM_VECTOR_LEN, signature.ptr);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    get publicKey() {
        const ret = wasm.signedmessage_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    get message() {
        const retptr = 8;
        const ret = wasm.signedmessage_message(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getArrayU8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * @returns {Signature}
    */
    get signature() {
        const ret = wasm.signedmessage_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    validate() {
        const ret = wasm.signedmessage_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithId(signer_id) {
        _assertClass(signer_id, KeyId);
        const ret = wasm.signedmessage_validateWithId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
}
module.exports.SignedMessage = SignedMessage;
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
    * @returns {Vault}
    */
    constructor(seed_phrase) {
        const ret = wasm.vault_new(passStringToWasm(seed_phrase), WASM_VECTOR_LEN);
        return Vault.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    serialize() {
        const retptr = 8;
        const ret = wasm.vault_serialize(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * @param {string} from
    * @returns {Vault}
    */
    static deserialize(from) {
        const ret = wasm.vault_deserialize(passStringToWasm(from), WASM_VECTOR_LEN);
        return Vault.__wrap(ret);
    }
    /**
    * @returns {any[]}
    */
    profiles() {
        const retptr = 8;
        const ret = wasm.vault_profiles(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getArrayJsValueFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 4);
        return v0;
    }
    /**
    * @returns {KeyId}
    */
    activeId() {
        const ret = wasm.vault_activeId(this.ptr);
        return ret === 0 ? undefined : KeyId.__wrap(ret);
    }
    /**
    * @returns {KeyId}
    */
    createId() {
        const ret = wasm.vault_createId(this.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * @param {KeyId} key_id
    * @param {Uint8Array} message
    * @returns {SignedMessage}
    */
    sign(key_id, message) {
        _assertClass(key_id, KeyId);
        const ret = wasm.vault_sign(this.ptr, key_id.ptr, passArray8ToWasm(message), WASM_VECTOR_LEN);
        return SignedMessage.__wrap(ret);
    }
}
module.exports.Vault = Vault;

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
};

module.exports.__wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};
wasm = require('./vault_bg');

