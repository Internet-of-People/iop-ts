import * as wasm from './iop_sdk_wasm_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

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

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {Uint8Array} plain_text
* @param {string} password
* @returns {Uint8Array}
*/
export function encrypt(plain_text, password) {
    var ptr0 = passArray8ToWasm0(plain_text, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    wasm.encrypt(8, ptr0, len0, ptr1, len1);
    var r0 = getInt32Memory0()[8 / 4 + 0];
    var r1 = getInt32Memory0()[8 / 4 + 1];
    var v2 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v2;
}

/**
* @param {Uint8Array} cipher_text
* @param {string} password
* @returns {Uint8Array}
*/
export function decrypt(cipher_text, password) {
    var ptr0 = passArray8ToWasm0(cipher_text, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    wasm.decrypt(8, ptr0, len0, ptr1, len1);
    var r0 = getInt32Memory0()[8 / 4 + 0];
    var r1 = getInt32Memory0()[8 / 4 + 1];
    var v2 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v2;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
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
* @param {string} name
* @returns {boolean}
*/
export function validateNetworkName(name) {
    var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.validateNetworkName(ptr0, len0);
    return ret !== 0;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);

function isLikeNone(x) {
    return x === undefined || x === null;
}
/**
* @param {any} operations
* @param {PrivateKey} private_key
* @returns {any}
*/
export function signMorpheusOperations(operations, private_key) {
    try {
        _assertClass(private_key, PrivateKey);
        var ret = wasm.signMorpheusOperations(addBorrowedObject(operations), private_key.ptr);
        return takeObject(ret);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

const int64CvtShim = new BigInt64Array(u32CvtShim.buffer);
/**
* @param {any} data
* @param {string} keep_properties_list
* @returns {string}
*/
export function selectiveDigestJson(data, keep_properties_list) {
    try {
        var ptr0 = passStringToWasm0(keep_properties_list, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.selectiveDigestJson(8, addBorrowedObject(data), ptr0, len0);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        heap[stack_pointer++] = undefined;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {any} data
* @returns {string}
*/
export function digestJson(data) {
    try {
        wasm.digestJson(8, addBorrowedObject(data));
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        heap[stack_pointer++] = undefined;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* @param {any} data
* @returns {string}
*/
export function stringifyJson(data) {
    try {
        wasm.stringifyJson(8, addBorrowedObject(data));
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        heap[stack_pointer++] = undefined;
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
*/
export class Bip32 {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip32_free(ptr);
    }
    /**
    * @param {Seed} seed
    * @param {string} name
    * @returns {Bip32Node}
    */
    static master(seed, name) {
        _assertClass(seed, Seed);
        var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip32_master(seed.ptr, ptr0, len0);
        return Bip32Node.__wrap(ret);
    }
}
/**
*/
export class Bip32Node {

    static __wrap(ptr) {
        const obj = Object.create(Bip32Node.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip32node_free(ptr);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip32node_network(8, this.ptr);
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
    get path() {
        try {
            wasm.bip32node_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {Bip32Node}
    */
    deriveNormal(idx) {
        var ret = wasm.bip32node_deriveNormal(this.ptr, idx);
        return Bip32Node.__wrap(ret);
    }
    /**
    * @param {number} idx
    * @returns {Bip32Node}
    */
    deriveHardened(idx) {
        var ret = wasm.bip32node_deriveHardened(this.ptr, idx);
        return Bip32Node.__wrap(ret);
    }
    /**
    * @returns {SecpPrivateKey}
    */
    privateKey() {
        var ret = wasm.bip32node_privateKey(this.ptr);
        return SecpPrivateKey.__wrap(ret);
    }
    /**
    * @returns {Bip32PublicNode}
    */
    neuter() {
        var ret = wasm.bip32node_neuter(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * @param {string} name
    * @returns {string}
    */
    toXprv(name) {
        try {
            var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.bip32node_toXprv(8, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} name
    * @returns {string}
    */
    toWif(name) {
        try {
            var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.bip32node_toWif(8, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip32PublicNode {

    static __wrap(ptr) {
        const obj = Object.create(Bip32PublicNode.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip32publicnode_free(ptr);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip32publicnode_network(8, this.ptr);
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
    get path() {
        try {
            wasm.bip32publicnode_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {Bip32PublicNode}
    */
    deriveNormal(idx) {
        var ret = wasm.bip32publicnode_deriveNormal(this.ptr, idx);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * @returns {SecpPublicKey}
    */
    publicKey() {
        var ret = wasm.bip32publicnode_publicKey(this.ptr);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * @returns {SecpKeyId}
    */
    keyId() {
        var ret = wasm.bip32publicnode_keyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * @param {string} name
    * @returns {string}
    */
    toXpub(name) {
        try {
            var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.bip32publicnode_toXpub(8, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} name
    * @returns {string}
    */
    toP2pkh(name) {
        try {
            var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.bip32publicnode_toP2pkh(8, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip39 {

    static __wrap(ptr) {
        const obj = Object.create(Bip39.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip39_free(ptr);
    }
    /**
    * @param {string} lang_code
    */
    constructor(lang_code) {
        var ptr0 = passStringToWasm0(lang_code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip39_new(ptr0, len0);
        return Bip39.__wrap(ret);
    }
    /**
    * @returns {Bip39Phrase}
    */
    generate() {
        var ret = wasm.bip39_generate(this.ptr);
        return Bip39Phrase.__wrap(ret);
    }
    /**
    * @param {Uint8Array} entropy
    * @returns {Bip39Phrase}
    */
    entropy(entropy) {
        var ptr0 = passArray8ToWasm0(entropy, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip39_entropy(this.ptr, ptr0, len0);
        return Bip39Phrase.__wrap(ret);
    }
    /**
    * @param {string} phrase
    */
    validatePhrase(phrase) {
        var ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.bip39_validatePhrase(this.ptr, ptr0, len0);
    }
    /**
    * @param {string} prefix
    * @returns {any[]}
    */
    listWords(prefix) {
        var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.bip39_listWords(8, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4);
        return v1;
    }
    /**
    * @param {string} phrase
    * @returns {Bip39Phrase}
    */
    phrase(phrase) {
        var ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip39_phrase(this.ptr, ptr0, len0);
        return Bip39Phrase.__wrap(ret);
    }
}
/**
*/
export class Bip39Phrase {

    static __wrap(ptr) {
        const obj = Object.create(Bip39Phrase.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip39phrase_free(ptr);
    }
    /**
    * @param {string} password
    * @returns {Seed}
    */
    password(password) {
        var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip39phrase_password(this.ptr, ptr0, len0);
        return Seed.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get phrase() {
        try {
            wasm.bip39phrase_phrase(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44 {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44_free(ptr);
    }
    /**
    * @param {Seed} seed
    * @param {string} name
    * @returns {Bip44Coin}
    */
    static network(seed, name) {
        _assertClass(seed, Seed);
        var ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip44_network(seed.ptr, ptr0, len0);
        return Bip44Coin.__wrap(ret);
    }
}
/**
*/
export class Bip44Account {

    static __wrap(ptr) {
        const obj = Object.create(Bip44Account.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44account_free(ptr);
    }
    /**
    * @returns {Bip32Node}
    */
    node() {
        var ret = wasm.bip44account_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44account_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {boolean} change
    * @returns {Bip44SubAccount}
    */
    chain(change) {
        var ret = wasm.bip44account_chain(this.ptr, change);
        return Bip44SubAccount.__wrap(ret);
    }
    /**
    * @param {number} idx
    * @returns {Bip44Key}
    */
    key(idx) {
        var ret = wasm.bip44account_key(this.ptr, idx);
        return Bip44Key.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44account_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get account() {
        var ret = wasm.bip44account_account(this.ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44account_bip32_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Bip44PublicAccount}
    */
    neuter() {
        var ret = wasm.bip44account_neuter(this.ptr);
        return Bip44PublicAccount.__wrap(ret);
    }
    /**
    * @param {number} account
    * @param {string} xprv
    * @param {string} network
    * @returns {Bip44Account}
    */
    static fromXprv(account, xprv, network) {
        var ptr0 = passStringToWasm0(xprv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.bip44account_fromXprv(account, ptr0, len0, ptr1, len1);
        return Bip44Account.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get xprv() {
        try {
            wasm.bip44account_to_xprv(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44Coin {

    static __wrap(ptr) {
        const obj = Object.create(Bip44Coin.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44coin_free(ptr);
    }
    /**
    * @returns {Bip32Node}
    */
    node() {
        var ret = wasm.bip44coin_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44coin_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} account
    * @returns {Bip44Account}
    */
    account(account) {
        var ret = wasm.bip44coin_account(this.ptr, account);
        return Bip44Account.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44coin_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44coin_bip32_path(8, this.ptr);
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
    get xprv() {
        try {
            wasm.bip44coin_to_xprv(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44Key {

    static __wrap(ptr) {
        const obj = Object.create(Bip44Key.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44key_free(ptr);
    }
    /**
    * @returns {Bip32Node}
    */
    node() {
        var ret = wasm.bip44key_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44key_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {SecpPrivateKey}
    */
    privateKey() {
        var ret = wasm.bip44key_privateKey(this.ptr);
        return SecpPrivateKey.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44key_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get account() {
        var ret = wasm.bip44key_account(this.ptr);
        return ret;
    }
    /**
    * @returns {boolean}
    */
    get change() {
        var ret = wasm.bip44key_change(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {number}
    */
    get key() {
        var ret = wasm.bip44key_key(this.ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44key_bip32_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Bip44PublicKey}
    */
    neuter() {
        var ret = wasm.bip44key_neuter(this.ptr);
        return Bip44PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get wif() {
        try {
            wasm.bip44key_to_wif(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44PublicAccount {

    static __wrap(ptr) {
        const obj = Object.create(Bip44PublicAccount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44publicaccount_free(ptr);
    }
    /**
    * @returns {Bip32PublicNode}
    */
    node() {
        var ret = wasm.bip44publicaccount_node(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44publicaccount_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {boolean} change
    * @returns {Bip44PublicSubAccount}
    */
    chain(change) {
        var ret = wasm.bip44publicaccount_chain(this.ptr, change);
        return Bip44PublicSubAccount.__wrap(ret);
    }
    /**
    * @param {number} idx
    * @returns {Bip44PublicKey}
    */
    key(idx) {
        var ret = wasm.bip44publicaccount_key(this.ptr, idx);
        return Bip44PublicKey.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44publicaccount_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get account() {
        var ret = wasm.bip44publicaccount_account(this.ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44publicaccount_bip32_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} account
    * @param {string} xpub
    * @param {string} network
    * @returns {Bip44PublicAccount}
    */
    static fromXpub(account, xpub, network) {
        var ptr0 = passStringToWasm0(xpub, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.bip44publicaccount_fromXpub(account, ptr0, len0, ptr1, len1);
        return Bip44PublicAccount.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get xpub() {
        try {
            wasm.bip44publicaccount_to_xpub(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44PublicKey {

    static __wrap(ptr) {
        const obj = Object.create(Bip44PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44publickey_free(ptr);
    }
    /**
    * @returns {Bip32PublicNode}
    */
    node() {
        var ret = wasm.bip44publickey_node(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44publickey_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {SecpPublicKey}
    */
    publicKey() {
        var ret = wasm.bip44publickey_publicKey(this.ptr);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * @returns {SecpKeyId}
    */
    keyId() {
        var ret = wasm.bip44publickey_keyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44publickey_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get account() {
        var ret = wasm.bip44publickey_account(this.ptr);
        return ret;
    }
    /**
    * @returns {boolean}
    */
    get change() {
        var ret = wasm.bip44publickey_change(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {number}
    */
    get key() {
        var ret = wasm.bip44publickey_key(this.ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44publickey_bip32_path(8, this.ptr);
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
    get address() {
        try {
            wasm.bip44publickey_to_p2pkh_addr(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44PublicSubAccount {

    static __wrap(ptr) {
        const obj = Object.create(Bip44PublicSubAccount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44publicsubaccount_free(ptr);
    }
    /**
    * @returns {Bip32PublicNode}
    */
    node() {
        var ret = wasm.bip44publicsubaccount_node(this.ptr);
        return Bip32PublicNode.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44publicsubaccount_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {Bip44PublicKey}
    */
    key(idx) {
        var ret = wasm.bip44publicsubaccount_key(this.ptr, idx);
        return Bip44PublicKey.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44publicsubaccount_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get account() {
        var ret = wasm.bip44publicsubaccount_account(this.ptr);
        return ret;
    }
    /**
    * @returns {boolean}
    */
    get change() {
        var ret = wasm.bip44publicsubaccount_change(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44publicsubaccount_bip32_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} account
    * @param {boolean} change
    * @param {string} xpub
    * @param {string} network
    * @returns {Bip44PublicSubAccount}
    */
    static fromXpub(account, change, xpub, network) {
        var ptr0 = passStringToWasm0(xpub, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.bip44publicsubaccount_fromXpub(account, change, ptr0, len0, ptr1, len1);
        return Bip44PublicSubAccount.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get xpub() {
        try {
            wasm.bip44publicsubaccount_to_xpub(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Bip44SubAccount {

    static __wrap(ptr) {
        const obj = Object.create(Bip44SubAccount.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_bip44subaccount_free(ptr);
    }
    /**
    * @returns {Bip32Node}
    */
    node() {
        var ret = wasm.bip44subaccount_node(this.ptr);
        return Bip32Node.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.bip44subaccount_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {Bip44Key}
    */
    key(idx) {
        var ret = wasm.bip44subaccount_key(this.ptr, idx);
        return Bip44Key.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get slip44() {
        var ret = wasm.bip44subaccount_slip44(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get account() {
        var ret = wasm.bip44subaccount_account(this.ptr);
        return ret;
    }
    /**
    * @returns {boolean}
    */
    get change() {
        var ret = wasm.bip44subaccount_change(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.bip44subaccount_bip32_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Bip44PublicSubAccount}
    */
    neuter() {
        var ret = wasm.bip44subaccount_neuter(this.ptr);
        return Bip44PublicSubAccount.__wrap(ret);
    }
    /**
    * @param {number} account
    * @param {boolean} change
    * @param {string} xprv
    * @param {string} network
    * @returns {Bip44SubAccount}
    */
    static fromXprv(account, change, xprv, network) {
        var ptr0 = passStringToWasm0(xprv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.bip44subaccount_fromXprv(account, change, ptr0, len0, ptr1, len1);
        return Bip44SubAccount.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get xprv() {
        try {
            wasm.bip44subaccount_to_xprv(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_coeusasset_free(ptr);
    }
    /**
    * @param {any} data
    */
    constructor(data) {
        try {
            var ret = wasm.coeusasset_new(addBorrowedObject(data));
            return CoeusAsset.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {CoeusAsset}
    */
    static deserialize(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coeusasset_deserialize(ptr0, len0);
        return CoeusAsset.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    serialize() {
        wasm.coeusasset_serialize(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    }
    /**
    * @returns {any}
    */
    toJson() {
        var ret = wasm.coeusasset_toJson(this.ptr);
        return takeObject(ret);
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_coeustxbuilder_free(ptr);
    }
    /**
    * @param {string} network_name
    */
    constructor(network_name) {
        var ptr0 = passStringToWasm0(network_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coeustxbuilder_new(ptr0, len0);
        return CoeusTxBuilder.__wrap(ret);
    }
    /**
    * @param {SignedOperations} ops
    * @param {SecpPublicKey} sender_pubkey
    * @param {BigInt} nonce
    * @returns {any}
    */
    build(ops, sender_pubkey, nonce) {
        _assertClass(ops, SignedOperations);
        _assertClass(sender_pubkey, SecpPublicKey);
        uint64CvtShim[0] = nonce;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        var ret = wasm.coeustxbuilder_build(this.ptr, ops.ptr, sender_pubkey.ptr, low0, high0);
        return takeObject(ret);
    }
}
/**
*/
export class Did {

    static __wrap(ptr) {
        const obj = Object.create(Did.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_did_free(ptr);
    }
    /**
    * @param {string} did_str
    */
    constructor(did_str) {
        var ptr0 = passStringToWasm0(did_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.did_new(ptr0, len0);
        return Did.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static prefix() {
        try {
            wasm.did_prefix(8);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {KeyId} key_id
    * @returns {Did}
    */
    static fromKeyId(key_id) {
        _assertClass(key_id, KeyId);
        var ret = wasm.did_fromKeyId(key_id.ptr);
        return Did.__wrap(ret);
    }
    /**
    * @returns {KeyId}
    */
    defaultKeyId() {
        var ret = wasm.did_defaultKeyId(this.ptr);
        return KeyId.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            wasm.did_toString(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_domainname_free(ptr);
    }
    /**
    * @param {string} domain_name
    */
    constructor(domain_name) {
        var ptr0 = passStringToWasm0(domain_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.domainname_new(ptr0, len0);
        return DomainName.__wrap(ret);
    }
}
/**
*/
export class HydraParameters {

    static __wrap(ptr) {
        const obj = Object.create(HydraParameters.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hydraparameters_free(ptr);
    }
    /**
    * @param {string} network
    * @param {number} account
    */
    constructor(network, account) {
        var ptr0 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.hydraparameters_new(ptr0, len0, account);
        return HydraParameters.__wrap(ret);
    }
}
/**
*/
export class HydraPlugin {

    static __wrap(ptr) {
        const obj = Object.create(HydraPlugin.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hydraplugin_free(ptr);
    }
    /**
    * @param {Vault} vault
    * @param {string} unlock_password
    * @param {HydraParameters} parameters
    */
    static rewind(vault, unlock_password, parameters) {
        _assertClass(vault, Vault);
        var ptr0 = passStringToWasm0(unlock_password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(parameters, HydraParameters);
        wasm.hydraplugin_rewind(vault.ptr, ptr0, len0, parameters.ptr);
    }
    /**
    * @param {Vault} vault
    * @param {HydraParameters} parameters
    * @returns {HydraPlugin}
    */
    static get(vault, parameters) {
        _assertClass(vault, Vault);
        _assertClass(parameters, HydraParameters);
        var ret = wasm.hydraplugin_get(vault.ptr, parameters.ptr);
        return HydraPlugin.__wrap(ret);
    }
    /**
    * @returns {HydraPublic}
    */
    get pub() {
        var ret = wasm.hydraplugin_public(this.ptr);
        return HydraPublic.__wrap(ret);
    }
    /**
    * @param {string} unlock_password
    * @returns {HydraPrivate}
    */
    priv(unlock_password) {
        var ptr0 = passStringToWasm0(unlock_password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.hydraplugin_priv(this.ptr, ptr0, len0);
        return HydraPrivate.__wrap(ret);
    }
}
/**
*/
export class HydraPrivate {

    static __wrap(ptr) {
        const obj = Object.create(HydraPrivate.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hydraprivate_free(ptr);
    }
    /**
    * @returns {HydraPublic}
    */
    get pub() {
        var ret = wasm.hydraprivate_public(this.ptr);
        return HydraPublic.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.hydraprivate_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {Bip44Key}
    */
    key(idx) {
        var ret = wasm.hydraprivate_key(this.ptr, idx);
        return Bip44Key.__wrap(ret);
    }
    /**
    * @param {SecpPublicKey} id
    * @returns {Bip44Key}
    */
    keyByPublicKey(id) {
        _assertClass(id, SecpPublicKey);
        var ret = wasm.hydraprivate_keyByPublicKey(this.ptr, id.ptr);
        return Bip44Key.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get xpub() {
        try {
            wasm.hydraprivate_xpub(8, this.ptr);
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
    get xprv() {
        try {
            wasm.hydraprivate_xprv(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    get receiveKeys() {
        var ret = wasm.hydraprivate_receive_keys(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get changeKeys() {
        var ret = wasm.hydraprivate_change_keys(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {string} hyd_addr
    * @param {any} tx
    * @returns {any}
    */
    signHydraTransaction(hyd_addr, tx) {
        try {
            var ptr0 = passStringToWasm0(hyd_addr, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.hydraprivate_signHydraTransaction(this.ptr, ptr0, len0, addBorrowedObject(tx));
            return takeObject(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}
/**
*/
export class HydraPublic {

    static __wrap(ptr) {
        const obj = Object.create(HydraPublic.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hydrapublic_free(ptr);
    }
    /**
    * @returns {string}
    */
    get network() {
        try {
            wasm.hydrapublic_network(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {Bip44PublicKey}
    */
    key(idx) {
        var ret = wasm.hydrapublic_key(this.ptr, idx);
        return Bip44PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get xpub() {
        try {
            wasm.hydrapublic_xpub(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    get receiveKeys() {
        var ret = wasm.hydrapublic_receive_keys(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get changeKeys() {
        var ret = wasm.hydrapublic_change_keys(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {string} addr
    * @returns {Bip44PublicKey}
    */
    keyByAddress(addr) {
        var ptr0 = passStringToWasm0(addr, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.hydrapublic_keyByAddress(this.ptr, ptr0, len0);
        return Bip44PublicKey.__wrap(ret);
    }
}
/**
*/
export class HydraSigner {

    static __wrap(ptr) {
        const obj = Object.create(HydraSigner.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hydrasigner_free(ptr);
    }
    /**
    * @param {SecpPrivateKey} inner
    */
    constructor(inner) {
        _assertClass(inner, SecpPrivateKey);
        var ptr0 = inner.ptr;
        inner.ptr = 0;
        var ret = wasm.hydrasigner_new(ptr0);
        return HydraSigner.__wrap(ret);
    }
    /**
    * @param {any} transaction
    * @returns {any}
    */
    signHydraTransaction(transaction) {
        try {
            var ret = wasm.hydrasigner_signHydraTransaction(this.ptr, addBorrowedObject(transaction));
            return takeObject(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}
/**
*/
export class HydraTxBuilder {

    static __wrap(ptr) {
        const obj = Object.create(HydraTxBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hydratxbuilder_free(ptr);
    }
    /**
    * @param {string} network_name
    */
    constructor(network_name) {
        var ptr0 = passStringToWasm0(network_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.hydratxbuilder_new(ptr0, len0);
        return HydraTxBuilder.__wrap(ret);
    }
    /**
    * @param {SecpKeyId} recipient_id
    * @param {SecpPublicKey} sender_pubkey
    * @param {BigInt} amount_flake
    * @param {BigInt} nonce
    * @returns {any}
    */
    transfer(recipient_id, sender_pubkey, amount_flake, nonce) {
        _assertClass(recipient_id, SecpKeyId);
        _assertClass(sender_pubkey, SecpPublicKey);
        uint64CvtShim[0] = amount_flake;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        uint64CvtShim[0] = nonce;
        const low1 = u32CvtShim[0];
        const high1 = u32CvtShim[1];
        var ret = wasm.hydratxbuilder_transfer(this.ptr, recipient_id.ptr, sender_pubkey.ptr, low0, high0, low1, high1);
        return takeObject(ret);
    }
    /**
    * @param {SecpPublicKey} delegate
    * @param {SecpPublicKey} sender_pubkey
    * @param {BigInt} nonce
    * @returns {any}
    */
    vote(delegate, sender_pubkey, nonce) {
        _assertClass(delegate, SecpPublicKey);
        _assertClass(sender_pubkey, SecpPublicKey);
        uint64CvtShim[0] = nonce;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        var ret = wasm.hydratxbuilder_vote(this.ptr, delegate.ptr, sender_pubkey.ptr, low0, high0);
        return takeObject(ret);
    }
    /**
    * @param {SecpPublicKey} delegate
    * @param {SecpPublicKey} sender_pubkey
    * @param {BigInt} nonce
    * @returns {any}
    */
    unvote(delegate, sender_pubkey, nonce) {
        _assertClass(delegate, SecpPublicKey);
        _assertClass(sender_pubkey, SecpPublicKey);
        uint64CvtShim[0] = nonce;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        var ret = wasm.hydratxbuilder_unvote(this.ptr, delegate.ptr, sender_pubkey.ptr, low0, high0);
        return takeObject(ret);
    }
    /**
    * @param {SecpPublicKey} sender_pubkey
    * @param {string} delegate_name
    * @param {BigInt} nonce
    * @returns {any}
    */
    registerDelegate(sender_pubkey, delegate_name, nonce) {
        _assertClass(sender_pubkey, SecpPublicKey);
        var ptr0 = passStringToWasm0(delegate_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        uint64CvtShim[0] = nonce;
        const low1 = u32CvtShim[0];
        const high1 = u32CvtShim[1];
        var ret = wasm.hydratxbuilder_registerDelegate(this.ptr, sender_pubkey.ptr, ptr0, len0, low1, high1);
        return takeObject(ret);
    }
}
/**
*/
export class JwtBuilder {

    static __wrap(ptr) {
        const obj = Object.create(JwtBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_jwtbuilder_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.jwtbuilder_new();
        return JwtBuilder.__wrap(ret);
    }
    /**
    * @param {string} content_id
    * @returns {JwtBuilder}
    */
    static withContentId(content_id) {
        var ptr0 = passStringToWasm0(content_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.jwtbuilder_withContentId(ptr0, len0);
        return JwtBuilder.__wrap(ret);
    }
    /**
    * @param {PrivateKey} sk
    * @returns {string}
    */
    sign(sk) {
        try {
            _assertClass(sk, PrivateKey);
            wasm.jwtbuilder_sign(8, this.ptr, sk.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class JwtParser {

    static __wrap(ptr) {
        const obj = Object.create(JwtParser.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_jwtparser_free(ptr);
    }
    /**
    * @param {string} token
    */
    constructor(token) {
        var ptr0 = passStringToWasm0(token, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.jwtparser_new(ptr0, len0);
        return JwtParser.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    get publicKey() {
        var ret = wasm.jwtparser_public_key(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {BigInt}
    */
    get createdAt() {
        wasm.jwtparser_created_at(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = int64CvtShim[0];
        return n0;
    }
    /**
    * @returns {BigInt}
    */
    get timeToLive() {
        wasm.jwtparser_time_to_live(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = int64CvtShim[0];
        return n0;
    }
}
/**
*/
export class KeyId {

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
    * @param {SecpKeyId} secp
    * @returns {KeyId}
    */
    static fromSecp(secp) {
        _assertClass(secp, SecpKeyId);
        var ret = wasm.keyid_fromSecp(secp.ptr);
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
/**
*/
export class Morpheus {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheus_free(ptr);
    }
    /**
    * @param {Seed} seed
    * @returns {MorpheusRoot}
    */
    static root(seed) {
        _assertClass(seed, Seed);
        var ret = wasm.morpheus_root(seed.ptr);
        return MorpheusRoot.__wrap(ret);
    }
}
/**
*/
export class MorpheusKind {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusKind.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheuskind_free(ptr);
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.morpheuskind_bip32_path(8, this.ptr);
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
    get kind() {
        try {
            wasm.morpheuskind_kind(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} idx
    * @returns {MorpheusPrivateKey}
    */
    key(idx) {
        var ret = wasm.morpheuskind_key(this.ptr, idx);
        return MorpheusPrivateKey.__wrap(ret);
    }
}
/**
*/
export class MorpheusOperationBuilder {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusOperationBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheusoperationbuilder_free(ptr);
    }
    /**
    * @param {string} did
    * @param {any} last_tx_id
    */
    constructor(did, last_tx_id) {
        var ptr0 = passStringToWasm0(did, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusoperationbuilder_new(ptr0, len0, addHeapObject(last_tx_id));
        return MorpheusOperationBuilder.__wrap(ret);
    }
    /**
    * @param {string} authentication
    * @param {any} expires_at_height
    * @returns {any}
    */
    addKey(authentication, expires_at_height) {
        var ptr0 = passStringToWasm0(authentication, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusoperationbuilder_addKey(this.ptr, ptr0, len0, addHeapObject(expires_at_height));
        return takeObject(ret);
    }
    /**
    * @param {string} authentication
    * @returns {any}
    */
    revokeKey(authentication) {
        var ptr0 = passStringToWasm0(authentication, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusoperationbuilder_revokeKey(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} authentication
    * @param {string} right
    * @returns {any}
    */
    addRight(authentication, right) {
        var ptr0 = passStringToWasm0(authentication, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(right, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusoperationbuilder_addRight(this.ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {string} authentication
    * @param {string} right
    * @returns {any}
    */
    revokeRight(authentication, right) {
        var ptr0 = passStringToWasm0(authentication, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(right, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusoperationbuilder_revokeRight(this.ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    tombstoneDid() {
        var ret = wasm.morpheusoperationbuilder_tombstoneDid(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class MorpheusPlugin {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPlugin.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheusplugin_free(ptr);
    }
    /**
    * @param {Vault} vault
    * @param {string} unlock_password
    */
    static rewind(vault, unlock_password) {
        _assertClass(vault, Vault);
        var ptr0 = passStringToWasm0(unlock_password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.morpheusplugin_rewind(vault.ptr, ptr0, len0);
    }
    /**
    * @param {Vault} vault
    * @returns {MorpheusPlugin}
    */
    static get(vault) {
        _assertClass(vault, Vault);
        var ret = wasm.morpheusplugin_get(vault.ptr);
        return MorpheusPlugin.__wrap(ret);
    }
    /**
    * @returns {MorpheusPublic}
    */
    get pub() {
        var ret = wasm.morpheusplugin_public(this.ptr);
        return MorpheusPublic.__wrap(ret);
    }
    /**
    * @param {string} unlock_password
    * @returns {MorpheusPrivate}
    */
    priv(unlock_password) {
        var ptr0 = passStringToWasm0(unlock_password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusplugin_priv(this.ptr, ptr0, len0);
        return MorpheusPrivate.__wrap(ret);
    }
}
/**
*/
export class MorpheusPrivate {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPrivate.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheusprivate_free(ptr);
    }
    /**
    * @returns {MorpheusPublic}
    */
    get pub() {
        var ret = wasm.morpheusprivate_public(this.ptr);
        return MorpheusPublic.__wrap(ret);
    }
    /**
    * @returns {MorpheusPrivateKind}
    */
    get personas() {
        var ret = wasm.morpheusprivate_personas(this.ptr);
        return MorpheusPrivateKind.__wrap(ret);
    }
    /**
    * @param {PublicKey} pk
    * @returns {MorpheusPrivateKey}
    */
    keyByPublicKey(pk) {
        _assertClass(pk, PublicKey);
        var ret = wasm.morpheusprivate_keyByPublicKey(this.ptr, pk.ptr);
        return MorpheusPrivateKey.__wrap(ret);
    }
    /**
    * @param {KeyId} id
    * @returns {MorpheusPrivateKey}
    */
    keyById(id) {
        _assertClass(id, KeyId);
        var ret = wasm.morpheusprivate_keyById(this.ptr, id.ptr);
        return MorpheusPrivateKey.__wrap(ret);
    }
    /**
    * @param {KeyId} id
    * @param {Uint8Array} message
    * @returns {SignedBytes}
    */
    signDidOperations(id, message) {
        _assertClass(id, KeyId);
        var ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.morpheusprivate_signDidOperations(this.ptr, id.ptr, ptr0, len0);
        return SignedBytes.__wrap(ret);
    }
    /**
    * @param {KeyId} id
    * @param {any} js_req
    * @returns {SignedJson}
    */
    signWitnessRequest(id, js_req) {
        try {
            _assertClass(id, KeyId);
            var ret = wasm.morpheusprivate_signWitnessRequest(this.ptr, id.ptr, addBorrowedObject(js_req));
            return SignedJson.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {KeyId} id
    * @param {any} js_stmt
    * @returns {SignedJson}
    */
    signWitnessStatement(id, js_stmt) {
        try {
            _assertClass(id, KeyId);
            var ret = wasm.morpheusprivate_signWitnessStatement(this.ptr, id.ptr, addBorrowedObject(js_stmt));
            return SignedJson.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {KeyId} id
    * @param {any} js_presentation
    * @returns {SignedJson}
    */
    signClaimPresentation(id, js_presentation) {
        try {
            _assertClass(id, KeyId);
            var ret = wasm.morpheusprivate_signClaimPresentation(this.ptr, id.ptr, addBorrowedObject(js_presentation));
            return SignedJson.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}
/**
*/
export class MorpheusPrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheusprivatekey_free(ptr);
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.morpheusprivatekey_bip32_path(8, this.ptr);
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
    get kind() {
        try {
            wasm.morpheusprivatekey_kind(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    get idx() {
        var ret = wasm.morpheusprivatekey_idx(this.ptr);
        return ret;
    }
    /**
    * @returns {MorpheusPublicKey}
    */
    neuter() {
        var ret = wasm.morpheusprivatekey_neuter(this.ptr);
        return MorpheusPublicKey.__wrap(ret);
    }
    /**
    * @returns {PrivateKey}
    */
    privateKey() {
        var ret = wasm.morpheusprivatekey_privateKey(this.ptr);
        return PrivateKey.__wrap(ret);
    }
}
/**
*/
export class MorpheusPrivateKind {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPrivateKind.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheusprivatekind_free(ptr);
    }
    /**
    * @returns {string}
    */
    get kind() {
        try {
            wasm.morpheusprivatekind_kind(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    get count() {
        var ret = wasm.morpheusprivatekind_count(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {MorpheusPublicKind}
    */
    get pub() {
        var ret = wasm.morpheusprivatekind_neuter(this.ptr);
        return MorpheusPublicKind.__wrap(ret);
    }
    /**
    * @param {number} idx
    * @returns {MorpheusPrivateKey}
    */
    key(idx) {
        var ret = wasm.morpheusprivatekind_key(this.ptr, idx);
        return MorpheusPrivateKey.__wrap(ret);
    }
    /**
    * @param {number} idx
    * @returns {Did}
    */
    did(idx) {
        var ret = wasm.morpheusprivatekind_did(this.ptr, idx);
        return Did.__wrap(ret);
    }
    /**
    * @param {PublicKey} id
    * @returns {MorpheusPrivateKey}
    */
    keyByPublicKey(id) {
        _assertClass(id, PublicKey);
        var ret = wasm.morpheusprivatekind_keyByPublicKey(this.ptr, id.ptr);
        return MorpheusPrivateKey.__wrap(ret);
    }
}
/**
*/
export class MorpheusPublic {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPublic.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheuspublic_free(ptr);
    }
    /**
    * @returns {MorpheusPublicKind}
    */
    get personas() {
        var ret = wasm.morpheuspublic_personas(this.ptr);
        return MorpheusPublicKind.__wrap(ret);
    }
    /**
    * @param {KeyId} id
    * @returns {PublicKey}
    */
    keyById(id) {
        _assertClass(id, KeyId);
        var ret = wasm.morpheuspublic_keyById(this.ptr, id.ptr);
        return PublicKey.__wrap(ret);
    }
}
/**
*/
export class MorpheusPublicKey {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheuspublickey_free(ptr);
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.morpheuspublickey_bip32_path(8, this.ptr);
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
    get kind() {
        try {
            wasm.morpheuspublickey_kind(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    get idx() {
        var ret = wasm.morpheuspublickey_idx(this.ptr);
        return ret;
    }
    /**
    * @returns {PublicKey}
    */
    publicKey() {
        var ret = wasm.morpheuspublickey_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
}
/**
*/
export class MorpheusPublicKind {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusPublicKind.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheuspublickind_free(ptr);
    }
    /**
    * @returns {string}
    */
    get kind() {
        try {
            wasm.morpheuspublickind_kind(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    get count() {
        var ret = wasm.morpheuspublickind_count(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} idx
    * @returns {PublicKey}
    */
    key(idx) {
        var ret = wasm.morpheuspublickind_key(this.ptr, idx);
        return PublicKey.__wrap(ret);
    }
    /**
    * @param {number} idx
    * @returns {Did}
    */
    did(idx) {
        var ret = wasm.morpheuspublickind_did(this.ptr, idx);
        return Did.__wrap(ret);
    }
    /**
    * @param {KeyId} id
    * @returns {PublicKey}
    */
    keyById(id) {
        _assertClass(id, KeyId);
        var ret = wasm.morpheuspublickind_keyById(this.ptr, id.ptr);
        return PublicKey.__wrap(ret);
    }
}
/**
*/
export class MorpheusRoot {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusRoot.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheusroot_free(ptr);
    }
    /**
    * @returns {string}
    */
    get path() {
        try {
            wasm.morpheusroot_bip32_path(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {MorpheusKind}
    */
    personas() {
        var ret = wasm.morpheusroot_personas(this.ptr);
        return MorpheusKind.__wrap(ret);
    }
}
/**
*/
export class MorpheusTxBuilder {

    static __wrap(ptr) {
        const obj = Object.create(MorpheusTxBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_morpheustxbuilder_free(ptr);
    }
    /**
    * @param {string} network_name
    * @param {SecpPublicKey} sender_pubkey
    * @param {BigInt} nonce
    */
    constructor(network_name, sender_pubkey, nonce) {
        var ptr0 = passStringToWasm0(network_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(sender_pubkey, SecpPublicKey);
        uint64CvtShim[0] = nonce;
        const low1 = u32CvtShim[0];
        const high1 = u32CvtShim[1];
        var ret = wasm.morpheustxbuilder_new(ptr0, len0, sender_pubkey.ptr, low1, high1);
        return MorpheusTxBuilder.__wrap(ret);
    }
    /**
    * @param {string} content_id
    * @returns {MorpheusTxBuilder}
    */
    addRegisterBeforeProof(content_id) {
        var ptr0 = passStringToWasm0(content_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.morpheustxbuilder_addRegisterBeforeProof(this.ptr, ptr0, len0);
        return MorpheusTxBuilder.__wrap(ret);
    }
    /**
    * @param {any} signed_operation
    * @returns {MorpheusTxBuilder}
    */
    addSigned(signed_operation) {
        try {
            var ret = wasm.morpheustxbuilder_addSigned(this.ptr, addBorrowedObject(signed_operation));
            return MorpheusTxBuilder.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @returns {any}
    */
    build() {
        var ret = wasm.morpheustxbuilder_build(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class NoncedOperations {

    static __wrap(ptr) {
        const obj = Object.create(NoncedOperations.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_noncedoperations_free(ptr);
    }
    /**
    * @param {State} state
    * @returns {Price}
    */
    price(state) {
        _assertClass(state, State);
        var ret = wasm.noncedoperations_price(this.ptr, state.ptr);
        return Price.__wrap(ret);
    }
    /**
    * @param {PrivateKey} sk
    * @returns {SignedOperations}
    */
    sign(sk) {
        var ptr = this.ptr;
        this.ptr = 0;
        _assertClass(sk, PrivateKey);
        var ret = wasm.noncedoperations_sign(ptr, sk.ptr);
        return SignedOperations.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    serialize() {
        try {
            wasm.noncedoperations_serialize(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class NoncedOperationsBuilder {

    static __wrap(ptr) {
        const obj = Object.create(NoncedOperationsBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_noncedoperationsbuilder_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.noncedoperationsbuilder_new();
        return NoncedOperationsBuilder.__wrap(ret);
    }
    /**
    * @param {UserOperation} user_operation
    * @returns {NoncedOperationsBuilder}
    */
    add(user_operation) {
        var ptr = this.ptr;
        this.ptr = 0;
        _assertClass(user_operation, UserOperation);
        var ret = wasm.noncedoperationsbuilder_add(ptr, user_operation.ptr);
        return NoncedOperationsBuilder.__wrap(ret);
    }
    /**
    * @param {BigInt} nonce
    * @returns {NoncedOperations}
    */
    build(nonce) {
        var ptr = this.ptr;
        this.ptr = 0;
        uint64CvtShim[0] = nonce;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        var ret = wasm.noncedoperationsbuilder_build(ptr, low0, high0);
        return NoncedOperations.__wrap(ret);
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_price_free(ptr);
    }
    /**
    * @returns {BigInt}
    */
    get fee() {
        wasm.price_fee(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = uint64CvtShim[0];
        return n0;
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_principal_free(ptr);
    }
    /**
    * @returns {Principal}
    */
    static system() {
        var ret = wasm.principal_system();
        return Principal.__wrap(ret);
    }
    /**
    * @param {PublicKey} pk
    * @returns {Principal}
    */
    static publicKey(pk) {
        _assertClass(pk, PublicKey);
        var ret = wasm.principal_publicKey(pk.ptr);
        return Principal.__wrap(ret);
    }
    /**
    * @param {PublicKey} pk
    */
    validateImpersonation(pk) {
        _assertClass(pk, PublicKey);
        wasm.principal_validateImpersonation(this.ptr, pk.ptr);
    }
}
/**
*/
export class PrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(PrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_privatekey_free(ptr);
    }
    /**
    * @param {SecpPrivateKey} sk
    * @returns {PrivateKey}
    */
    static fromSecp(sk) {
        _assertClass(sk, SecpPrivateKey);
        var ret = wasm.privatekey_fromSecp(sk.ptr);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    publicKey() {
        var ret = wasm.privatekey_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} data
    * @returns {Signature}
    */
    signEcdsa(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.privatekey_signEcdsa(this.ptr, ptr0, len0);
        return Signature.__wrap(ret);
    }
}
/**
*/
export class PublicKey {

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
    * @param {SecpPublicKey} pk
    * @returns {PublicKey}
    */
    static fromSecp(pk) {
        _assertClass(pk, SecpPublicKey);
        var ret = wasm.publickey_fromSecp(pk.ptr);
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
    * @param {Uint8Array} data
    * @param {Signature} signature
    * @returns {boolean}
    */
    validateEcdsa(data, signature) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Signature);
        var ret = wasm.publickey_validateEcdsa(this.ptr, ptr0, len0, signature.ptr);
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
/**
*/
export class SecpKeyId {

    static __wrap(ptr) {
        const obj = Object.create(SecpKeyId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_secpkeyid_free(ptr);
    }
    /**
    * @param {string} address
    * @param {string} network
    * @returns {SecpKeyId}
    */
    static fromAddress(address, network) {
        var ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.secpkeyid_fromAddress(ptr0, len0, ptr1, len1);
        return SecpKeyId.__wrap(ret);
    }
}
/**
*/
export class SecpPrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(SecpPrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_secpprivatekey_free(ptr);
    }
    /**
    * @param {string} phrase
    * @returns {SecpPrivateKey}
    */
    static fromArkPassphrase(phrase) {
        var ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secpprivatekey_fromArkPassphrase(ptr0, len0);
        return SecpPrivateKey.__wrap(ret);
    }
    /**
    * @param {string} wif
    * @param {string} network
    * @returns {SecpPrivateKey}
    */
    static fromWif(wif, network) {
        var ptr0 = passStringToWasm0(wif, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.secpprivatekey_fromWif(ptr0, len0, ptr1, len1);
        return SecpPrivateKey.__wrap(ret);
    }
    /**
    * @param {string} network
    * @returns {string}
    */
    toWif(network) {
        try {
            var ptr0 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.secpprivatekey_toWif(8, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {SecpPublicKey}
    */
    publicKey() {
        var ret = wasm.secpprivatekey_publicKey(this.ptr);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} data
    * @returns {SecpSignature}
    */
    signEcdsa(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secpprivatekey_signEcdsa(this.ptr, ptr0, len0);
        return SecpSignature.__wrap(ret);
    }
}
/**
*/
export class SecpPublicKey {

    static __wrap(ptr) {
        const obj = Object.create(SecpPublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_secppublickey_free(ptr);
    }
    /**
    * @param {string} key
    */
    constructor(key) {
        var ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secppublickey_new(ptr0, len0);
        return SecpPublicKey.__wrap(ret);
    }
    /**
    * @returns {SecpKeyId}
    */
    keyId() {
        var ret = wasm.secppublickey_keyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * @returns {SecpKeyId}
    */
    arkKeyId() {
        var ret = wasm.secppublickey_arkKeyId(this.ptr);
        return SecpKeyId.__wrap(ret);
    }
    /**
    * @param {SecpKeyId} key_id
    * @returns {boolean}
    */
    validateId(key_id) {
        _assertClass(key_id, SecpKeyId);
        var ret = wasm.secppublickey_validateId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * @param {SecpKeyId} key_id
    * @returns {boolean}
    */
    validateArkId(key_id) {
        _assertClass(key_id, SecpKeyId);
        var ret = wasm.secppublickey_validateArkId(this.ptr, key_id.ptr);
        return ret !== 0;
    }
    /**
    * @param {Uint8Array} data
    * @param {SecpSignature} signature
    * @returns {boolean}
    */
    validateEcdsa(data, signature) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signature, SecpSignature);
        var ret = wasm.secppublickey_validateEcdsa(this.ptr, ptr0, len0, signature.ptr);
        return ret !== 0;
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            wasm.secppublickey_toString(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class SecpSignature {

    static __wrap(ptr) {
        const obj = Object.create(SecpSignature.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_secpsignature_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {SecpSignature}
    */
    static fromDer(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secpsignature_fromDer(ptr0, len0);
        return SecpSignature.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    toDer() {
        wasm.secpsignature_toDer(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    }
    /**
    * @returns {string}
    */
    toString() {
        try {
            wasm.secpsignature_toString(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class Seed {

    static __wrap(ptr) {
        const obj = Object.create(Seed.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_seed_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    */
    constructor(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.seed_new(ptr0, len0);
        return Seed.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    static demoPhrase() {
        try {
            wasm.seed_demoPhrase(8);
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
    static legacyPassword() {
        try {
            wasm.seed_legacyPassword(8);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    toBytes() {
        wasm.seed_toBytes(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    }
}
/**
*/
export class Signature {

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
    * @param {SecpSignature} secp
    * @returns {Signature}
    */
    static fromSecp(secp) {
        _assertClass(secp, SecpSignature);
        var ret = wasm.signature_fromSecp(secp.ptr);
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
/**
*/
export class SignedBytes {

    static __wrap(ptr) {
        const obj = Object.create(SignedBytes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_signedbytes_free(ptr);
    }
    /**
    * @param {PublicKey} public_key
    * @param {Uint8Array} content
    * @param {Signature} signature
    */
    constructor(public_key, content, signature) {
        _assertClass(public_key, PublicKey);
        var ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Signature);
        var ret = wasm.signedbytes_new(public_key.ptr, ptr0, len0, signature.ptr);
        return SignedBytes.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    get publicKey() {
        var ret = wasm.signedbytes_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    get content() {
        wasm.signedbytes_content(8, this.ptr);
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
        var ret = wasm.signedbytes_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    validate() {
        var ret = wasm.signedbytes_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithKeyId(signer_id) {
        _assertClass(signer_id, KeyId);
        var ret = wasm.signedbytes_validateWithKeyId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
    /**
    * @param {string} did_doc_str
    * @param {number | undefined} from_height_inc
    * @param {number | undefined} until_height_exc
    * @returns {any}
    */
    validateWithDidDoc(did_doc_str, from_height_inc, until_height_exc) {
        var ptr0 = passStringToWasm0(did_doc_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.signedbytes_validateWithDidDoc(this.ptr, ptr0, len0, !isLikeNone(from_height_inc), isLikeNone(from_height_inc) ? 0 : from_height_inc, !isLikeNone(until_height_exc), isLikeNone(until_height_exc) ? 0 : until_height_exc);
        return takeObject(ret);
    }
}
/**
*/
export class SignedJson {

    static __wrap(ptr) {
        const obj = Object.create(SignedJson.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_signedjson_free(ptr);
    }
    /**
    * @param {PublicKey} public_key
    * @param {any} content
    * @param {Signature} signature
    */
    constructor(public_key, content, signature) {
        try {
            _assertClass(public_key, PublicKey);
            _assertClass(signature, Signature);
            var ret = wasm.signedjson_new(public_key.ptr, addBorrowedObject(content), signature.ptr);
            return SignedJson.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @returns {PublicKey}
    */
    get publicKey() {
        var ret = wasm.signedjson_publicKey(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {any}
    */
    get content() {
        var ret = wasm.signedjson_content(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Signature}
    */
    get signature() {
        var ret = wasm.signedjson_signature(this.ptr);
        return Signature.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    validate() {
        var ret = wasm.signedjson_validate(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {KeyId} signer_id
    * @returns {boolean}
    */
    validateWithKeyId(signer_id) {
        _assertClass(signer_id, KeyId);
        var ret = wasm.signedjson_validateWithKeyId(this.ptr, signer_id.ptr);
        return ret !== 0;
    }
    /**
    * @param {string} did_doc_str
    * @param {number | undefined} from_height_inc
    * @param {number | undefined} until_height_exc
    * @returns {any}
    */
    validateWithDidDoc(did_doc_str, from_height_inc, until_height_exc) {
        var ptr0 = passStringToWasm0(did_doc_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.signedjson_validateWithDidDoc(this.ptr, ptr0, len0, !isLikeNone(from_height_inc), isLikeNone(from_height_inc) ? 0 : from_height_inc, !isLikeNone(until_height_exc), isLikeNone(until_height_exc) ? 0 : until_height_exc);
        return takeObject(ret);
    }
}
/**
*/
export class SignedOperations {

    static __wrap(ptr) {
        const obj = Object.create(SignedOperations.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_signedoperations_free(ptr);
    }
    /**
    * @param {any} data
    */
    constructor(data) {
        try {
            var ret = wasm.signedoperations_new(addBorrowedObject(data));
            return SignedOperations.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {State} state
    * @returns {Price}
    */
    price(state) {
        _assertClass(state, State);
        var ret = wasm.signedoperations_price(this.ptr, state.ptr);
        return Price.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    verify() {
        var ret = wasm.signedoperations_verify(this.ptr);
        return ret !== 0;
    }
}
/**
*/
export class State {

    static __wrap(ptr) {
        const obj = Object.create(State.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_state_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.state_new();
        return State.__wrap(ret);
    }
    /**
    * @param {DomainName} name
    * @returns {any}
    */
    resolveData(name) {
        _assertClass(name, DomainName);
        var ret = wasm.state_resolveData(this.ptr, name.ptr);
        return takeObject(ret);
    }
    /**
    * @param {SignedOperations} ops
    * @returns {BigInt}
    */
    applySignedOperations(ops) {
        _assertClass(ops, SignedOperations);
        wasm.state_applySignedOperations(8, this.ptr, ops.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = uint64CvtShim[0];
        return n0;
    }
    /**
    * @param {SystemOperation} op
    * @returns {BigInt}
    */
    applySystemOperation(op) {
        _assertClass(op, SystemOperation);
        wasm.state_applySystemOperation(8, this.ptr, op.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = uint64CvtShim[0];
        return n0;
    }
    /**
    * @returns {BigInt}
    */
    get version() {
        wasm.state_version(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        u32CvtShim[0] = r0;
        u32CvtShim[1] = r1;
        const n0 = uint64CvtShim[0];
        return n0;
    }
    /**
    * @param {BigInt} to_version
    */
    undoLastOperation(to_version) {
        uint64CvtShim[0] = to_version;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.state_undoLastOperation(this.ptr, low0, high0);
    }
    /**
    * @returns {number}
    */
    get lastSeenHeight() {
        var ret = wasm.state_last_seen_height(this.ptr);
        return ret >>> 0;
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_subtreepolicies_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.subtreepolicies_new();
        return SubtreePolicies.__wrap(ret);
    }
    /**
    * @param {any} schema
    * @returns {SubtreePolicies}
    */
    withSchema(schema) {
        try {
            var ptr = this.ptr;
            this.ptr = 0;
            var ret = wasm.subtreepolicies_withSchema(ptr, addBorrowedObject(schema));
            return SubtreePolicies.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @param {number} max_block_count
    * @returns {SubtreePolicies}
    */
    withExpiration(max_block_count) {
        var ptr = this.ptr;
        this.ptr = 0;
        var ret = wasm.subtreepolicies_withExpiration(ptr, max_block_count);
        return SubtreePolicies.__wrap(ret);
    }
}
/**
*/
export class SystemOperation {

    static __wrap(ptr) {
        const obj = Object.create(SystemOperation.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_systemoperation_free(ptr);
    }
    /**
    * @param {number} height
    * @returns {SystemOperation}
    */
    static startBlock(height) {
        var ret = wasm.systemoperation_startBlock(height);
        return SystemOperation.__wrap(ret);
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

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

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
            _assertClass(name, DomainName);
            _assertClass(owner, Principal);
            _assertClass(subtree_policies, SubtreePolicies);
            var ret = wasm.useroperation_register(name.ptr, owner.ptr, subtree_policies.ptr, addBorrowedObject(data), expires_at_height);
            return UserOperation.__wrap(ret);
        } finally {
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
            _assertClass(name, DomainName);
            var ret = wasm.useroperation_update(name.ptr, addBorrowedObject(data));
            return UserOperation.__wrap(ret);
        } finally {
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
        var ret = wasm.useroperation_renew(name.ptr, expires_at_height);
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
        var ret = wasm.useroperation_transfer(name.ptr, to_owner.ptr);
        return UserOperation.__wrap(ret);
    }
    /**
    * @param {DomainName} name
    * @returns {UserOperation}
    */
    static delete(name) {
        _assertClass(name, DomainName);
        var ret = wasm.useroperation_delete(name.ptr);
        return UserOperation.__wrap(ret);
    }
}
/**
*/
export class ValidationIssue {

    static __wrap(ptr) {
        const obj = Object.create(ValidationIssue.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_validationissue_free(ptr);
    }
    /**
    * @returns {number}
    */
    get code() {
        var ret = wasm.validationissue_code(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {string}
    */
    get severity() {
        try {
            wasm.validationissue_severity(8, this.ptr);
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
    get reason() {
        try {
            wasm.validationissue_reason(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class ValidationResult {

    static __wrap(ptr) {
        const obj = Object.create(ValidationResult.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_validationresult_free(ptr);
    }
    /**
    * @returns {string}
    */
    get status() {
        try {
            wasm.validationresult_status(8, this.ptr);
            var r0 = getInt32Memory0()[8 / 4 + 0];
            var r1 = getInt32Memory0()[8 / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any[]}
    */
    get messages() {
        wasm.validationresult_messages(8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4);
        return v0;
    }
}
/**
*/
export class Vault {

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
    * @param {string} phrase
    * @param {string} bip39_password
    * @param {string} unlock_password
    * @param {string | undefined} language
    * @returns {Vault}
    */
    static create(phrase, bip39_password, unlock_password, language) {
        var ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(bip39_password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(unlock_password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(language) ? 0 : passStringToWasm0(language, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ret = wasm.vault_create(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        return Vault.__wrap(ret);
    }
    /**
    * @param {any} data
    * @returns {Vault}
    */
    static load(data) {
        try {
            var ret = wasm.vault_load(addBorrowedObject(data));
            return Vault.__wrap(ret);
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
    * @returns {any}
    */
    save() {
        var ret = wasm.vault_save(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {boolean}
    */
    get dirty() {
        var ret = wasm.vault_is_dirty(this.ptr);
        return ret !== 0;
    }
    /**
    */
    setDirty() {
        wasm.vault_setDirty(this.ptr);
    }
    /**
    * @param {string} password
    * @returns {Seed}
    */
    unlock(password) {
        var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vault_unlock(this.ptr, ptr0, len0);
        return Seed.__wrap(ret);
    }
}

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbg_getTime_8e7a0578598e5039 = function(arg0) {
    var ret = getObject(arg0).getTime();
    return ret;
};

export const __wbg_new0_8d817915cd890bd8 = function() {
    var ret = new Date();
    return addHeapObject(ret);
};

export const __wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export const __wbg_getRandomValues_3ac1b33c90b52596 = function(arg0, arg1, arg2) {
    getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
};

export const __wbg_randomFillSync_6f956029658662ec = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

export const __wbg_self_1c83eb4471d9eb9b = handleError(function() {
    var ret = self.self;
    return addHeapObject(ret);
});

export const __wbg_require_5b2b5b594d809d9f = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
};

export const __wbg_crypto_c12f14e810edcaa2 = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export const __wbg_msCrypto_679be765111ba775 = function(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export const __wbg_getRandomValues_05a60bf171bfc2be = function(arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

export const __wbg_static_accessor_MODULE_abf5ae284bffdf45 = function() {
    var ret = module;
    return addHeapObject(ret);
};

export const __wbindgen_json_parse = function(arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_validationissue_new = function(arg0) {
    var ret = ValidationIssue.__wrap(arg0);
    return addHeapObject(ret);
};

export const __wbg_validationresult_new = function(arg0) {
    var ret = ValidationResult.__wrap(arg0);
    return addHeapObject(ret);
};

