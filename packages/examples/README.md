# IoP DAC (Project Morpheus) SDK Examples

This repository contains example codes how can IoP DAC be used.  Also, you can even test it via command line commands described below.

## Requirements

- NodeJS 12
- A running Hydra node. It can be local, testnet/devnet/mainnet.

## Install

Run in the root of the [morpheus-ts](https://github.com/Internet-of-People/morpheus-ts) project.

```bash
$ npm install
$ npm run build
```

## Available Commands

Run these commands under `packages/example`.

### Vault

```bash
# Init vault
$ node . vault init
```

```bash
# Created DID
$ node . vault createId
```

```bash
# List
$ node . vault list
```

### Key Management

```bash
# Add Key
$ node . key add
```

```bash
# Revoke Key
$ node . key revoke
```

### Right Management

```bash
# Add Right
$ node . right add
```

```bash
# Revoke Right
$ node . right revoke
```

### DID Management

```bash
# Tombstone DID
$ node . tombstone
```

### Before Proof

```bash
# Register a Content Id
$ node . before-proof register
```

### Transfer

```bash
# Transfer Hydra from the Genesis Wallet
$ node . transfer
```

## Check also

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/morpheus-ts>