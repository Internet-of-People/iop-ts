# Changelog

## 4.0.1

- Restrict Coeus transactions with a JSON schema.

## 4.0.0

TODO

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
