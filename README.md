# Morpheus

Morpheus is a decentralized identity system with an open ecosystem enabling verifiable claims in a
web-of-trust way. See the [specification](https://iop-stack.gitlab.iop-ventures.com/dids-and-claims/specification)
or check out the [whitepaper](https://iop.global/whitepaper/) where this fits.

## How to Build

### Prerequisites

```bash
# Install nvm to easily switch between node versions
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
# Install node itself using nvm
$ nvm install v12.13.1
# Set the just installed version 12 as default
$ nvm alias default v12.13.1
# Check versions
$ node --version
v12.13.1
$ npm --version
6.13.1
```

Some components (e.g. the keyvault) are implemented in Rust.
The easiest way to deploy a Rust environment is to visit the
[Rustup page](https://rustup.rs/) and follow the instructions.

```bash
# You should have got Rust installed already
$ rustc --version
rustc 1.39.0 (4560ea788 2019-11-04)
# Install Rust's WebAssembly toolset 
$ cargo install wasm-pack
```


### Build

```bash
# Setup all dependencies
$ npm install
# Lint and build all packages
$ npm run build
# Run all tests
$ npm run test
...
lerna success - @internet-of-people/...
```
