# Morpheus Keyvault

The Morpheus Keyvault is a stateless cryptographic calculator. This npm package wraps the rust implementation through WASM into a persistent vault.

## Table of Contents <!-- omit in toc -->

- [Update from upstream](#update-from-upstream)
- [Check also](#check-also)

## Update from upstream

- Clone the original rust sources from https://github.com/Internet-of-People/mercury-rust
- Build it with `cargo build` in the workspace folder
- In the `wasm` folder, run `./build.sh`. It will probably complain about missing dependencies, like `wasm-pack` and `clang`.
- Copy over the whole `pkg` folder into this npm package and commit it after passing all tests.

## Check also

Please read about maintainers, contribution contract and license in the parent folder.
