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

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function passArray8ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);
    getUint8Memory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
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

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
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

function isLikeNone(x) {
    return x === undefined || x === null;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
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
    * @param {string} public_key
    * @param {Uint8Array} message
    * @param {string} signature
    * @returns {SignedMessage}
    */
    constructor(public_key, message, signature) {
        const ret = wasm.signedmessage_new(passStringToWasm(public_key), WASM_VECTOR_LEN, passArray8ToWasm(message), WASM_VECTOR_LEN, passStringToWasm(signature), WASM_VECTOR_LEN);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get public_key() {
        const retptr = 8;
        const ret = wasm.signedmessage_public_key(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
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
    * @returns {string}
    */
    get signature() {
        const retptr = 8;
        const ret = wasm.signedmessage_signature(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
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
    * @returns {string}
    */
    active_id() {
        const retptr = 8;
        const ret = wasm.vault_active_id(retptr, this.ptr);
        const memi32 = getInt32Memory();
        let v0;
        if (memi32[retptr / 4 + 0] !== 0) {
            v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
            wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        }
        return v0;
    }
    /**
    * @returns {string}
    */
    create_id() {
        const retptr = 8;
        const ret = wasm.vault_create_id(retptr, this.ptr);
        const memi32 = getInt32Memory();
        const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    }
    /**
    * @param {string} id_str
    * @param {Uint8Array} message
    * @returns {SignedMessage}
    */
    sign(id_str, message) {
        const ret = wasm.vault_sign(this.ptr, passStringToWasm(id_str), WASM_VECTOR_LEN, passArray8ToWasm(message), WASM_VECTOR_LEN);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @param {string | undefined} signer_id_str
    * @param {SignedMessage} signed_message
    * @returns {boolean}
    */
    validate_signature(signer_id_str, signed_message) {
        const ptr0 = isLikeNone(signer_id_str) ? 0 : passStringToWasm(signer_id_str);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(signed_message, SignedMessage);
        const ret = wasm.vault_validate_signature(this.ptr, ptr0, len0, signed_message.ptr);
        return ret !== 0;
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

