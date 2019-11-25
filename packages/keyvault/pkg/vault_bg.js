
const path = require('path').join(__dirname, 'vault_bg.wasm');
const bytes = require('fs').readFileSync(path);
let imports = {};
imports['./vault.js'] = require('./vault.js');

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
module.exports = wasmInstance.exports;
