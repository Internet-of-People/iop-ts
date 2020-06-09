# IoP SDK

This package contains all Typescript tool you need to interact with *IoP DAC* and *Fort* APIs and create awesome apps.
For more info please visit the [IoP Developer Portal](https://developer.iop.global/).

*This SDK will improve over time to be able to use it more easily.*

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Usage](#usage)
- [Modules](#modules)
  - [Types Module](#types-module)
    - [Usage](#usage-1)
    - [Authority](#authority)
    - [Crypto](#crypto)
    - [Inspector](#inspector)
    - [Layer1](#layer1)
    - [Layer2](#layer2)
    - [Sdk](#sdk)
    - [Verifier](#verifier)
  - [Layer-1 Module](#layer-1-module)
    - [Transfer Hydra](#transfer-hydra)
    - [Register Before-Proof Transaction](#register-before-proof-transaction)
    - [Key and Right Management Transactions](#key-and-right-management-transactions)
    - [Tombstone DID Transaction](#tombstone-did-transaction)
  - [Layer-2 Module](#layer-2-module)
    - [Get Before-Proof History](#get-before-proof-history)
    - [Before-Proof Exists](#before-proof-exists)
    - [Get Transaction Status](#get-transaction-status)
    - [Get DID Document](#get-did-document)
    - [Get Last Transaction ID](#get-last-transaction-id)
  - [Crypto Module](#crypto-module)
    - [Low Level Functions](#low-level-functions)
    - [JSON Masking](#json-masking)
    - [Vault](#vault)
    - [Crypto Plugins](#crypto-plugins)
  - [Authority Module](#authority-module)
  - [Ark Module - DEPRECATED](#ark-module---deprecated)
  - [Network Module](#network-module)
  - [Utils Module](#utils-module)
    - [Log](#log)
- [Contribution and License](#contribution-and-license)

## Prerequisites

- NodeJS v12.6.1+
- NPM 6.13.4+

## Install

```bash
$ npm install @internet-of-people/sdk --save
```

## Usage

```typescript
import { Ark, Authority, Crypto, Layer1, Layer2, Network, Types, Utils } from '@internet-of-people/sdk';
```

For more information about the modules, check the corresponding module section below.

## Modules

The SDK has several modules you can use. As the SDK's structure is a bit complex, we had hard time to figure it out that how can we form it into a hierarchy which is usable due to the Typescript import/export weaknesses.
This is why we have the `Types` module that contains only interfaces and types, nothing else. In that package we use the latest Typescript 3.8 feature, [type only import/exports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export), hence all interfaces and types available under the Types module are exported with `export type`.

### Types Module

Contains all interfaces for all of our other modules so you can easily know if you're importing an `interface` or a `type` and you can avoid importing issues.

#### Usage

```typescript
import { Types } from '@internet-of-people/sdk';

const {
  Authority,
  Crypto,
  Inspector,
  Layer1,
  Layer2,
  Sdk,
  Verifier,
} = Types;
```

All interfaces have the corresponding module under root, where you can access it's classes.

#### Authority

All interfaces and types that needed to be able to communicate with an Authority endpoint. See more about the Authority's API [here](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/authority-service).

#### Crypto

All interfaces and types you need to use the [Crypto Module](#Crypto-Module) to create vault, keys & DID wrappers, etc. See more info about this package under the [Crypto Module](#Crypto-Module) section.

#### Inspector

All interfaces and types that needed to be able to communicate with an Inspector endpoint. See more about the Inspector's API [here](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/inspector-service).

#### Layer1

All interfaces you need to interact with the Layer-1 API.

#### Layer2

All interfaces you need to interact with the Layer-2 API.

#### Sdk

All interfaces that describes the DAC (Morpheus) protocol including all participants defined in the specification.

#### Verifier

All interfaces and types that needed to be able to communicate with a Verifier endpoint. Currently our verifier is implemented in the inspector package, hence to see more about the Verifier's API, please visit [this page](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/inspector-service).

### Layer-1 Module

This package contains all Typescript class and utils that you need to interact with the DAC Layer-1 API. Below we provide you example how can you interact with Layer-1 APIs.

#### Transfer Hydra

```typescript
import { Layer1 } from '@internet-of-people/sdk';

const api = await Layer1.createApi(Layer1.Network.Devnet);
const amount = 10; // 10 HYD

// With passhprase...
await api.sendTransferTxWithPassphrase(
  'SENDER_ARK_PASSPHRASE',
  'RECIPIENT_ADDRESS',
  BigInt(amount) * BigInt(1e8),
);

// ... or with WIF
await api.sendTransferTxWithWIF(
  'SENDER_WIF',
  'RECIPIENT_ADDRESS',
  BigInt(amount) * BigInt(1e8),
);
```

> Note, that we soon release a new version where we will be able to sign with the vault, not using any private credentials.

#### Register Before-Proof Transaction

```typescript
import { Layer1, Network } from '@internet-of-people/sdk';

const api = await Layer1.createApi(Network.Devnet);
const opAttempts = new Layer1.OperationAttemptsBuilder()
    .registerBeforeProof('YOUR_CONTENT_ID')
    .getAttempts();

// With passhprase...
const txId = await api.sendMorpheusTxWithPassphrase(
  opAttempts,
  'SENDER_ARK_PASSPHRASE',
);

// ... or with WIF
const txId = await api.sendMorpheusTxWithWIF(
  opAttempts,
  'SENDER_WIF',
);
```

> Note, that we soon release a new version where you can sign with the vault without exporting a WIF first.

#### Key and Right Management Transactions

In this example we

- add a secondary key,
- then we give some rights to it,
- then we revoke rights from the first key,
- and finally we revoke the first key itself.

> Note: This can be done in one or separated transactions as well!

```typescript
import { Crypto, Layer1, Layer2, Network } from '@internet-of-people/sdk';

// Creating vault
const layer1Api = await Layer1.createApi(Network.Devnet);
const layer2Api = Layer2.createApi(Network.Devnet);
const unlockPassword = 'correct horse battery staple';
const vault = Crypto.Vault.create(
  Crypto.Seed.demoPhrase(),
  'OPTIONAL_BIP39_PASSWORD',
  unlockPassword
);

// Creating the Layer-2 plugin
Crypto.MorpheusPlugin.rewind(vault, unlockPassword);
const morpheus = Crypto.MorpheusPlugin.get(vault);

// Collect transaction requirements
const did = morpheus.pub.personas.did(0); // let's use the first DID
const firstKey = did.defaultKeyId(); // by default only the initial key has the right to update the DID document
const secondaryKey = ...; // another key (one of your own or somebody else's)
const expiresAtHeight = 42; // the key will not be valid after the 42th block height
const systemRights = new Layer2.SystemRights();

// Adding the new key with rights
const firstTxOpAttempts = new Layer1.OperationAttemptsBuilder()
  .withVault(vault)
  .signWith(morpheus.priv(unlockPassword))
  .on(did, await layer2Api.getLastTxId(did))
  .addKey(secondaryKey, expiresAtHeight)
  .addRight(secondaryKey, systemRights.update)
  .addRight(secondaryKey, systemRights.impersonate)
  .sign(firstKey)
  .getAttempts();

const firstTxId = await layer1Api.sendMorpheusTxWithPassphrase(firstTxOpAttempts, 'SENDER_ARK_PASSPHRASE');

// Revoking the old key
const secondTxOpAttempts = new Layer1.OperationAttemptsBuilder()
  .signWith(morpheus.priv(unlockPassword))
  .on(did, await layer2Api.getLastTxId(did))
  .revokeRight(firstKey, systemRights.update)
  .revokeRight(firstKey, systemRights.impersonate)
  .revokeKey(firstKey)
  .sign(secondaryKey)
  .getAttempts();

const secondTxId = await layer1Api.sendMorpheusTxWithPassphrase(
  secondTxOpAttempts,
  'SENDER_ARK_PASSPHRASE',
);
```

#### Tombstone DID Transaction

```typescript
import { Crypto, Layer1, Layer2, Network } from '@internet-of-people/sdk';

// Creating vault
const layer1Api = await Layer1.createApi(Network.Devnet);
const layer2Api = Layer2.createApi(Network.Devnet);
const unlockPassword = 'correct horse battery staple';
const vault = Crypto.Vault.create(
  Crypto.Seed.demoPhrase(),
  'OPTIONAL_BIP39_PASSWORD',
  unlockPassword,
);

// Creating the Layer-2 plugin
Crypto.MorpheusPlugin.rewind(vault, unlockPassword)
const morpheus = Crypto.MorpheusPlugin.get(vault);

// Collect transaction requirements
const did = morpheus.pub.personas.did(0);
const firstKey = did.defaultKeyId();

// Adding the new key with rights
const operationAttempts = new Layer1.OperationAttemptsBuilder()
  .signWith(morpheus.priv(unlockPassword))
  .on(did, await layer2Api.getLastTxId(did))
  .tombstoneDid()
  .sign(firstKey)
  .getAttempts();

const txId = await layer1Api.sendMorpheusTxWithPassphrase(
  operationAttempts,
  'SENDER_ARK_PASSPHRASE',
);
```

### Layer-2 Module

This package contains all Typescript class and utils that you need to interact with the DAC Layer-2 API.

#### Get Before-Proof History

```typescript
import { Layer2, Network } from '@internet-of-people/sdk';

const api = Layer2.createApi(Network.Devnet);

// let's suppose that the contentId below was sent in at height 42 and the actual height is 4242

console.log(await api.getBeforeProofHistory('YOUR_CONTENT_ID'));
// {"contentId":"YOUR_CONTENT_ID","existsFromHeight":42,"queriedAtHeight":4242}
```

#### Before-Proof Exists

```typescript
import { Layer2, Network } from '@internet-of-people/sdk';

const api = Layer2.createApi(Network.Devnet);

// let's suppose that the contentId below was sent in at height 42 and the actual height is 4242

console.log(await api.beforeProofExists('YOUR_CONTENT_ID'));
// true

console.log(await api.beforeProofExists('YOUR_CONTENT_ID', 43));
// true

console.log(await api.beforeProofExists('YOUR_CONTENT_ID', 41));
// false
```

#### Get Transaction Status

```typescript
import { Layer2, Network } from '@internet-of-people/sdk';

const api = Layer2.createApi(Network.Devnet);
const status = await api.getTxnStatus('THE_LAYER_1_TX_ID_CONTAINED_A_DAC_OPERATION');
// if the tx is not found, it will be an empty Optional.
// if the tx is there, it will be an Optional<bool>, where
// false means that the tx was successfully sent but was rejected by the layer-2 consensus and
// true means the tx was accepted and applied in the layer-2 state.
```

Note that layer2 status is returned here hence transactions containing layer2 operations are expected.
Layer1 transactions are not found thus `Optional.empty()` is returned for them as well.
For a description of our Layer2 transactions and consensus,
[see the specification](https://developer.iop.global/#/dac?id=decentralized-ledger-dlt).

#### Get DID Document

```typescript
import { Layer2, Network } from '@internet-of-people/sdk';

const api = Layer2.createApi(Network.Devnet);
const document = await api.getDidDocument('A_DID');
```

#### Get Last Transaction ID

```typescript
import { Layer2, Network } from '@internet-of-people/sdk';

const api = Layer2.createApi(Network.Devnet);
const lastTxId = await api.getLastTxId('A_DID');
```

### Crypto Module

Under this package we reexport our [morpheus-crypto package](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/morpheus-crypto)'s functionality.

#### Low Level Functions

The package contains high level tools like the Vault or JSON masking and such. But, it also contains low level classes and utilities for wallet integrators or for people who really know what they're doing.

You can inspect these APIs int the file we re-export from the sdk, [here](https://github.com/Internet-of-People/morpheus-ts/blob/master/packages/morpheus-crypto/src/index.ts).

#### JSON Masking

For a basic understanding of our data masking solution, consult
[the specification](https://developer.iop.global/#/glossary?id=masked-claim-presentation).

Function `mask` provides a generic solution for masking JSON documents.
Argument `json` is the serialized Json document as a string to be processed.
In argument `keepPaths` you can specify a string containing a comma-separated list of paths.
Collapsing the Merkle-tree will stop at these nodes, their whole Json subtrees will be kept untouched.
All other paths will be recursively collapsed, keeping only the specified paths open.
The format of the Json path list was built on the path concepts of the
[JQ (Json Query) tool](https://stedolan.github.io/jq/manual/#Basicfilters).
The function returns the masked Json document as a string on success.

Function `digest` is just an alias for a special case when the whole document is to be collapsed masking all details and only a single content ID of the root remains.

```typescript
import { Crypto, Types } from '@internet-of-people/sdk';

const content = {"data": {"key": "value"}, "timestamp": "2020.02.02 02:02:02", "version": 1};
const contentId = Crypto.digest(content);
const maskedData = Crypto.mask(content, ".timestamp, .version");
```

#### Vault

The Vault is a general purpose hierarchical deterministic (HD) generator for asymmetric keys. Read more about in [its repository](https://github.com/Internet-of-People/keyvault-rust).

##### Creating a Vault

```typescript
import { Crypto } from '@internet-of-people/sdk';

const vault = await Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
);

// or you can load it from an alredy serialized state
const vault = await Crypto.Vault.load(JSON.parse(serialized));
```

This will create an in-memory vault with touching any storage.

##### Options (save, unlock)

The vault has an optional last parameter for both `create` and `load`, called `context`, where you can define how you'd like to persist the wallet and how you'd like to provide encryption password for it.

By default both have a default implementation: no persist; no password.

```typescript
import { Crypto } from '@internet-of-people/sdk';

const vault = await Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
  {
    askUnlockPassword: async (forDecrypt: boolean) => Promise<string> {
      /* 
      Here you can define how you'd like to provide a password to the wallet if it needs it for unlocking. Usually on the UI a dialog will appear that asks for the unlock password the user provided during the vault creation.
      forDecrypt is false when creating the vault for the 1st time, true in all other cases
      */
    },
    save: async (state: IVaultState) => Promise<void> {
      /*
        This method is called every time when the vault's state is changed for any reason. Hence, you can use this to persist the state if its changed. For serialization you can use JSON.stringify(state).
      */
    },
  },
);
```

##### Unlock for Seed

You can unlock your wallet anytime to get your seed back.

```typescript
import { Crypto } from '@internet-of-people/sdk';

const vault = await Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
);

const seed = await vault.unlock();
```

##### Trigger Save Manually

Despite the `save` callback you provide is called anytime the state changes, you can also trigger it manually.

```typescript
import { Crypto } from '@internet-of-people/sdk';

const vault = await Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
);

const seed = await vault.save();
```

#### Crypto Plugins

The `Crypto` modul has a very modular approach to providing you plugins that might use the same shared `Vault`.

All of these plugins are subtrees derived from your seed.

All plugins provide you a public and a private interface to interact with. 
For example the Hydra plugin provides you a `Bip44PublicAccount` and a `Bip44Account` for public and private interfaces, but it may differ for other plugins.

##### Hydra Plugin

The Hydra plugin is a Bip44 based implementation for - mainly - the Hydra Coin. You can create multiple Hydra accounts from a single seed and for all accounts you can create multiple addresses.

An example for creating Hydra Testnet addresses:

```typescript
import { Crypto } from '@internet-of-people/sdk';

const vault = await Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
);

const hydra = await Crypto.hydra(
  vault,
  {
    network: Crypto.Coin.Hydra.Testnet, // it also supports BTC, Ark coins
    account: 0 // you can have multiple accounts under the same Hydra subtree, we use the first one here
  },
);

const firstAddress = hydra.pub.key(0);
const secondAddress = hydra.pub.key(1);
```

The optional third parameter for `Crypto.hydra` is `IHydraContext` where you can specify your rewind process to be able to rewind the plugin's state from a ledger or other storages.

To learn the Hydra plugin's public and private interface, please check [its repository](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/morpheus-crypto).

- Public interface: `Bip44PublicAccount`
- Private interface: `Bip44Account`

##### Morpheus Plugin

The Morpheus (or as we officially call, DAC) plugin is all about IoP DAC. If you are not familiar with DAC, we highly recommend you to visit our [developer portal](https://developer.iop.global/#/dac) for more information.

Using this plugin you can create your own personas and its DIDs.

An example for creating a DID and accessing its key:

```typescript
import { Crypto } from '@internet-of-people/sdk';

const unlockPassword = 'correct horse battery staple';
const vault = await Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
  unlockPassword
);

Crypto.MorpheusPlugin.rewind(vault, unlockPassword);
const morpheus = Crypto.MorpheusPlugin.get(vault);
const morpheusPrivate = morpheus.priv(unlockPassword);

const did = morpheus.pub.personas.did(0);
const keyId = did.defaultKeyId();
const key = await morpheusPrivate.personas.key(0);
const publicKey = key.publicKey();
key.signEcdsa(Uint8Array);
```

Study the implementation of `Crypto.MorpheusPlugin.rewind` to create a better implementation that
discovers traces of existing DIDs on the storage your application is using and adds them to the
public state of the vault that later can be used without unlocking it.

### Authority Module

Currently contains only one enum, `Status` which describes a possible status for a Witness Request.

### Ark Module - DEPRECATED

Under this module we reexport the complete [@arkecosystem/crypto](https://www.npmjs.com/package/@arkecosystem/crypto) package.

> Note, that the package version is fixed at `^2.6.31` and it will be removed as soon as we 100% integrate our own solutions.

### Network Module

In this module you can access some `enum` and other `const` which helps you to use Hydra network parameters.

```typescript
import { allNetworks, schemaAndHost, Network } from '@internet-of-people/sdk';

const network = Network.LocalTestnet;

console.log(allNetworks); // will print out an array containing all field in the Network enum

const host = schemaAndHost(Network.LocalTestnet); // will be 'http://127.0.0.1'
```


### Utils Module

#### Log

A simple logger utlity that used by other Morpheus packages for consistent log prefixing. Uses the Logger interface from `@arkecosystem/core-interfaces`.

```typescript
import { Utils } from '@internet-of-people/sdk';

// Example
// Where container is a Container.IContainer from @arkecosystem/core-interfaces
const log = new Utils.AppLog(container.resolvePlugin('logger'));
log.debug('hello');
```

## Contribution and License

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/morpheus-ts>
