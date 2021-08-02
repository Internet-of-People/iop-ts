# IOP SDK

This package contains all Typescript tool you need to interact with *IOP SSI* and *Fort* APIs and create awesome apps.
For more info please visit the [IOP Developer Portal](https://developer.iop.technology/).

*This SDK will improve over time to be able to use it more easily.*

## Table of Contents <!-- omit in toc -->

- [Usage](#usage)
- [Modules](#modules)
  - [Types Module](#types-module)
    - [Usage](#usage-1)
    - [Authority](#authority)
    - [Crypto](#crypto)
    - [Inspector](#inspector)
    - [Layer-1](#layer-1)
    - [Layer-2](#layer-2)
    - [Sdk](#sdk)
    - [Verifier](#verifier)
  - [Layer-1 Module](#layer-1-module)
  - [Layer-2 Module](#layer-2-module)
  - [Coeus-2 Module](#coeus-module)
  - [Crypto Module](#crypto-module)
    - [Low Level Functions](#low-level-functions)
    - [JSON Digesting](#json-digesting)
    - [Vault](#vault)
    - [Crypto Plugins](#crypto-plugins)
  - [Authority Module](#authority-module)
  - [Ark Module - DEPRECATED](#ark-module---deprecated)
  - [Network Module](#network-module)
- [Contribution and License](#contribution-and-license)

## Usage

Please visit the [IOP Developer Portal](https://developer.iop.technology) for detailed instructions.

Please note that despite our best efforts, changes we cannot control deep down in the dependency chain of our library might still cause problems for the client using our SDK. To avoid many of those problems, we recommend adding `"skipLibCheck": true,` to your `tsconfig.json`. You might also fix the encountered problems manually instead. For example, we've recently experienced Typescript definition dependencies missing from a faulty package and had to add `"@types/socketcluster-client": "^13.0.3",` to `devDependencies` in the `package.json` of a client using our SDK.

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
  Morpheus,
  Verifier,
} = Types;
```

All interfaces have the corresponding module under root, where you can access it's classes.

#### Authority

All interfaces and types that needed to be able to communicate with an Authority endpoint. See more about the Authority's API [here](https://developer.iop.technology/api/authority_api).

#### Crypto

All interfaces and types you need to use the [Crypto Module](#Crypto-Module) to create vault, keys & DID wrappers, etc. See more info about this package under the [Crypto Module](#Crypto-Module) section.

#### Inspector

All interfaces and types that needed to be able to communicate with an Inspector endpoint. See more about the Inspector's API [here](https://developer.iop.technology/api/inspector_api).

#### Layer-1

All interfaces you need to interact with the layer-1 API.

#### Layer-2

All interfaces you need to interact with the layer-2 API.

#### Sdk

All interfaces that describes the IOP SSI (Morpheus) protocol including all participants defined in the specification.

#### Verifier

All interfaces and types that needed to be able to communicate with a Verifier endpoint. Currently our verifier is implemented in the inspector package, hence to see more about the Verifier's API, please visit [this page](https://developer.iop.technology/api/verifier_api).

### Layer-1 Module

This package contains all Typescript class and utils that you need to interact with the Layer-1 API. Below we provide you example how can you interact with Layer-1 APIs.

For more detailed examples please visit our [tutorial center](https://developer.iop.technology/sdk/?id=tutorial-center) and our [Typescript Samples](https://github.com/Internet-of-People/ts-examples).

### Layer-2 Module

This package contains all Typescript class and utils that you need to interact with the layer-2 API.

For more detailed examples please visit our [tutorial center](https://developer.iop.technology/sdk/?id=tutorial-center) and our [Typescript Samples](https://github.com/Internet-of-People/ts-examples).

### Coeus Module

This package contains all Typescript class and utils you need to use IOP DNS (project Coeus).

For more detailed examples please visit our [tutorial center](https://developer.iop.technology/sdk/?id=tutorial-center) and our [Typescript Samples](https://github.com/Internet-of-People/ts-examples).

### Crypto Module

Under this package we reexport our [morpheus-crypto package](https://github.com/Internet-of-People/iop-ts/tree/master/packages/morpheus-crypto)'s functionality.

#### Low Level Functions

The package contains high level tools like the Vault or JSON digesting and such. But, it also contains low level classes and utilities for wallet integrators or for people who really know what they're doing.

You can inspect these APIs in the file we re-export from the sdk, [here](https://github.com/Internet-of-People/iop-ts/blob/master/packages/morpheus-crypto/src/index.ts).

#### JSON Digesting

For a basic understanding of our data digesting solution, consult
[the specification](https://developer.iop.technology/glossary?id=masked-claim-presentation).

Function `selectiveDigestJson` provides a generic solution for digesting JSON documents.
Argument `json` is the serialized Json document as a string to be processed.
In argument `keepPaths` you can specify a string containing a comma-separated list of paths.
Collapsing the Merkle-tree will stop at these nodes, their whole Json subtrees will be kept untouched.
All other paths will be recursively collapsed, keeping only the specified paths open.
The format of the Json path list was built on the path concepts of the
[JQ (Json Query) tool](https://stedolan.github.io/jq/manual/#Basicfilters).
The function returns the digested Json document as a string on success.

Function `digestJson` is just an alias for a special case when the whole document is to be collapsed digesting all details and only a single content ID of the root remains.

```typescript
import { Crypto, Types } from '@internet-of-people/sdk';

const content = {"data": {"key": "value"}, "timestamp": "2020.02.02 02:02:02", "version": 1};
const contentId = Crypto.digestJson(content);
const digestedData = Crypto.selectiveDigestJson(content, ".timestamp, .version");
```

#### Vault

The Vault is a general purpose hierarchical deterministic (HD) generator for asymmetric keys. Read more about in [its repository](https://github.com/Internet-of-People/keyvault-rust).

For more detailed examples please visit our [tutorial center](https://developer.iop.technology/sdk/?id=tutorial-center) and our [Typescript Samples](https://github.com/Internet-of-People/ts-examples).

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

const vault = Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'OPTIONAL_BIP39_PASSWORD',
  'UNLOCK_PASSWORD',
);

const hydraParams = new Crypto.HydraParameters(
  Crypto.Coin.Hydra.Testnet, // it also supports BTC, Ark coins
  0 // you can have multiple accounts under the same Hydra subtree, we use the first one here
);

// You have to rewind the state of the account in order to access it. We provided a mock implementation
// that does not look at the blockchain, just adds 1 receiving address.
Crypto.HydraPlugin.init(vault, 'UNLOCK_PASSWORD', hydraParams);
const hydra = Crypto.HydraPlugin.get(vault, hydraParams);

const firstAddress = hydra.pub.key(0);
const secondAddress = hydra.pub.key(1);
// The vault remembers that you accessed this 2nd receiving address, so it sets isDirty, which is
// only cleared by saving the vault save.
```

To learn the Hydra plugin's public and private interface, please check [its repository](https://github.com/Internet-of-People/iop-ts/tree/master/packages/morpheus-crypto).

- Public interface: `Bip44PublicAccount`
- Private interface: `Bip44Account`

##### Morpheus Plugin

The Morpheus (or as we officially call, IOP SSI) plugin is all about IOP SSI. If you are not familiar with SSI, we highly recommend you to visit our [developer portal](https://developer.iop.technology/ssi) for more information.

Using this plugin you can create your own personas and its DIDs.

An example for creating a DID and accessing its key:

```typescript
import { Crypto } from '@internet-of-people/sdk';

const unlockPassword = 'correct horse battery staple';
const vault = Crypto.Vault.create(
  'BIP39_MNEMONIC_SEED',
  'BIP39_PASSWORD',
  unlockPassword
);

Crypto.MorpheusPlugin.init(vault, unlockPassword);
const morpheus = Crypto.MorpheusPlugin.get(vault);
const morpheusPrivate = morpheus.priv(unlockPassword);

const did = morpheus.pub.personas.did(0);
const keyId = did.defaultKeyId();
const key = morpheusPrivate.personas.key(0);
const publicKey = key.publicKey();
key.signEcdsa(Uint8Array);
```

Study the implementation of `Crypto.MorpheusPlugin.init` to create a better implementation that
discovers traces of existing DIDs on the storage your application is using and adds them to the
public state of the vault that later can be used without unlocking it.

### Authority Module

Currently contains only one enum, `Status` which describes a possible status for a Witness Request.

### Ark Module - DEPRECATED

Under this module we reexport the complete [@arkecosystem/crypto](https://www.npmjs.com/package/@arkecosystem/crypto) package.

> Note, that the package version is fixed at `^2.6.31` and it will be removed as soon as we 100% integrate our own solutions.

### Network Module

To be able to use either the layer-1 or layer-2 API, you have to be able to identify where you'd like to connect to.
This module contains the enums and other classes you have to user when you create an API.

## Contribution and License

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/iop-ts>
