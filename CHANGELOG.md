# Changelog

## 4.0.6

- Upgrade ARK dependencies to `^2.7.24`.
- BUGFIX: fixing a bug that made Coeus's state corrupted after a revert.

## 4.0.5

- Upgraded to 0.0.11 sdk-wasm.
- Coeus tx fees are based on the asset's size.
- Deprecated send methods which sign with passphrase or WIF in a favor of signing with Vault.
- Added `sendCoeusTx` to `Layer1` API.

## 4.0.4

- Morpheus and Coeus are enabled based on milestones.

## 4.0.3

- Upgraded to 0.0.9 sdk-wasm.

## 4.0.2

- Upgraded to 0.0.8 sdk-wasm.

## 4.0.1

- Restrict Coeus transactions with a JSON schema.
- Coeus TX is limitied to be a maximum of 1MB.
- Developer portal URLs updated.

## 4.0.0

- BREAKING: construction of Layer1 and Layer2 APIs are now a bit different. Please check the latest [examples](https://github.com/Internet-of-People/ts-examples).
- Coeus API and other Coeus related codes are now public and final.

## 3.3.1

- Hydra plugin and DID manager are now publicly available
- Coeus Plugin added

## 3.2.0

### Added

- Authority service verifies the JWT token sent in the header during private API calls. Read more about JWT authentication on the [IOP developer portal](https://developer.iop.global/api/auth).
- Logs can be configured now to prevent printing SDK logs to the console.

### BUGFIX

- Layer1 API's `getTxnStatus` returned a slightly different data compared to the interface definition.
- The README got extended with a notice that sometimes Typescript developers have to add a typing to their dependencies to prevent some error messages during Typescript compile.
