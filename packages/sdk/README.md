# IoP SDK

This package contains all Typescript tool you need to interact with *IoP DAC* and *Fort* APIs and create awesome apps.
For more info please visit the [IoP Developer Portal](https://iop-stack.iop.rocks/dids-and-claims/specification/).

*This SDK will improve over time to be able to use it more easily.*

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#Prerequisites)
- [Install](#Install)
- [Usage](#Usage)
- [Modules](#Modules)
  - [Types Module](#Types-Module)
  - [Layer-1 Module](#Layer-1-Module)
    - [Transfer Hydra](#Transfer-Hydra)
    - [Register Before-Proof Transaction](#Register-Before-Proof-Transaction)
    - [Key and Right Management Transactions](#Key-and-Right-Management-Transactions)
    - [Tombstone DID Transaction](#Tombstone-DID-Transaction)
  - [Layer-2 Module](#Layer-2-Module)
    - [Get Before-Proof History](#Get-Before-Proof-History)
    - [Before-Proof Exists](#Before-Proof-Exists)
    - [Get Transaction Status](#Get-Transaction-Status)
    - [Get DID Document](#Get-DID-Document)
    - [Get Last Transaction ID](#Get-Last-Transaction-ID)
  - [Crypto Module](#Crypto-Module)
    - [Utility Functions](#Utility-Functions)
    - [In-Memory Vault](#In-Memory-Vault)
    - [Persistent Vault](#Persistent-Vault)
  - [Authority Module](#Authority-Module)
  - [JsonUtils Module](#JsonUtils-Module)
  - [Ark Module](#Ark-Module)
  - [Network Module](#Network-Module)
  - [Utils Module](#Utils-Module)
- [Contribution and License](#Contribution-and-License)

## Prerequisites

- NodeJS v12.6.1+
- NPM 6.13.4+

## Install

```bash
$ npm install @internet-of-people/sdk --save
```

## Usage

```typescript
import { Ark, Authority, Crypto, JsonUtils, Layer1, Layer2, Network, Types, Utils } from '@internet-of-people/sdk';
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
import { Ark, Layer1 } from '@internet-of-people/sdk';

const api = await Layer1.createApi(Layer1.Network.Devnet);
const amount = 10; // 10 HYD

await api.sendTransferTx(
  'SENDER_BIP38_PASSPHRASE',
  'RECIPIENT_ADDRESS',
  Ark.Utils.BigNumber.make(amount).times(1e8),
);
```

#### Register Before-Proof Transaction

```typescript
import { Layer1, Network } from '@internet-of-people/sdk';

const api = await Layer1.createApi(Network.Devnet);
const opAttempts = new Layer1.OperationAttemptsBuilder()
    .registerBeforeProof('YOUR_CONTENT_ID')
    .getAttempts();

const txId = await api.sendMorpheusTx(opAttempts, 'SENDER_BIP38_PASSPHRASE');
```

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
const vault = Crypto.PersistentVault.fromSeedPhrase(Crypto.PersistentVault.DEMO_PHRASE, 'YOUR_VAULT_PATH');

// Collect transaction requirements
const did = vault.createDid(); // let's use the first DID
const firstKey = did.defaultKeyId(); // by default only the initial key has the right to update the DID document
const secondaryKey = ...; // another key (one of your own or somebody else's)
const expiresAtHeight = 42; // the key will not be valid after the 42th block height
const systemRights = new Layer2.SystemRights();

// Adding the new key with rights
const firstTxOpAttempts = new Layer1.OperationAttemptsBuilder()
  .withVault(vault)
  .on(did, await layer2Api.getLastTxId(did))
  .addKey(secondaryKey, expiresAtHeight)
  .addRight(secondaryKey, systemRights.update)
  .addRight(secondaryKey, systemRights.impersonate)
  .sign(firstKey)
  .getAttempts();

const firstTxId = await layer1Api.sendMorpheusTx(firstTxOpAttempts, 'SENDER_BIP38_PASSPHRASE');

// Revoking the old key
const secondTxOpAttempts = new Layer1.OperationAttemptsBuilder()
  .withVault(vault)
  .on(did, await layer2Api.getLastTxId(did))
  .revokeRight(firstKey, systemRights.update)
  .revokeRight(firstKey, systemRights.impersonate)
  .revokeKey(firstKey)
  .sign(secondaryKey)
  .getAttempts();

const secondTxId = await layer1Api.sendMorpheusTx(secondTxOpAttempts, 'SENDER_BIP38_PASSPHRASE');
```

#### Tombstone DID Transaction

TODO this example needs editing:
 - dids are not created
 - keys should be queried from the DID
 - it's unclear what numbers in names mean, sometimes layer, sometimes var numbering

```typescript
import { Crypto, Layer1, Layer2, Network } from '@internet-of-people/sdk';

// Creating vault
const layer1Api = await Layer1.createApi(Network.Devnet);
const layer2Api = Layer2.createApi(Network.Devnet);
const vault = Crypto.PersistentVault.loadFile('YOUR_VAULT_PATH');

// Collect transaction requirements
const did = vault.activeDid();
const firstKey = ...; // the currently active key of the DID

// Adding the new key with rights
const operationAttempts = new Layer1.OperationAttemptsBuilder()
  .withVault(vault)
  .on(did, await layer2Api.getLastTxId(did))
  .tombstoneDid()
  .sign(firstKey)
  .getAttempts();

const txId = await layer1Api.sendMorpheusTx(operationAttempts, 'SENDER_BIP38_PASSPHRASE');
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
[see the specification](https://iop-stack.iop.rocks/dids-and-claims/specification/#/dac?id=decentralized-ledger-dlt).


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

#### Utility Functions

```typescript
import { Crypto } from '@internet-of-people/sdk';

// Generate a 45 character string with 264 bits of entropy to be used as a nonce.
const nonce = Crypto.nonce264();

// Create KeyId
const keyId = new Crypto.KeyId('iezbeWGSY2dqcUBqT8K7R14xr');

// Create DID wrapper
const did = new Crypto.Did('did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr');
```

#### In-Memory Vault

An in-memory vault, that does not persist state, it your job via the `serialize` and `deserialize` methods.

```typescript
import { Crypto } from '@internet-of-people/sdk';

// Create
const vault = new Crypto.Vault(Crypto.PersistentVault.DEMO_PHRASE);

// Serialize vault
const serialized = vault.serialize();

// Deserialize vault
const vault = Crypto.Vault.deserialize(serialized);

// List KeyIds
const keyIds = vault.keyIds();

// List DIDs
const dids = vault.dids();

// Get active DID
const activeDid = vault.activeDid();

// Create DID
const newDid = vault.createDid();
const keyId = newDid.defaultKeyId();

// Sign witness request
vault.signWitnessRequest(keyId, 'A_JSON_WITNESS_REQUEST');

// Sign witness statement
vault.signWitnessStatement(keyId, 'A_JSON_WITNESS_STATEMENT');

// Sign claim presentation
vault.signClaimPresentation(keyId, 'A_JSON_CLAIM_PRESENTATION');

// Sign DID operations
vault.signDidOperations(keyId, 'TBD');
```

#### Persistent Vault

A state-parsisted vault. In any case when you call its method which updates its state, it will automatically persist the state as well.

```typescript
import { Crypto } from '@internet-of-people/sdk';

// Create
const persistentFromFile = Crypto.PersistentVault.loadFile('YOUR_VAULT_PATH');
const persistentFromSeed = Crypto.PersistentVault.fromSeedPhrase(Crypto.PersistentVault.DEMO_PHRASE, 'YOUR_VAULT_PATH');


// Create and use vault
const vault = new Crypto.Vault(Crypto.PersistentVault.DEMO_PHRASE);

// List KeyIds
const keyIds = vault.keyIds();

// List DIDs
const dids = vault.dids();

// Get active DID
const activeDid = vault.activeDid();

// Create DID
const newDid = vault.createDid();
const keyId = newDid.defaultKeyId();

// Sign DID operations
vault.signDidOperations(keyId, 'TBD');
```

### Authority Module

Currently contains only one enum, `Status` which describes a possible status for a Witness Request.

### Ark Module

Under this module we reexport the complete [@arkecosystem/crypto](https://www.npmjs.com/package/@arkecosystem/crypto) package.
It's useful, because some of our interfaces require for example `Utils.BigNumber` from this package.

> Note, that the package version is fixed at `^2.6.31`.

### Network Module

In this module you can access some `enum` and other `const` which helps you to use Hydra network parameters.

```typescript
import { allNetworks, schemaAndHost, Network } from '@internet-of-people/sdk';

const network = Network.LocalTestnet;

console.log(allNetworks); // will print out an array containing all field in the Network enum

const host = schemaAndHost(Network.LocalTestnet); // will be 'http://127.0.0.1'
```

### JsonUtils Module

Currently contains only a JSON digest utility, which calculates the ContentId of any content representible as a JSON object.

```typescript
import { JsonUtils, Types } from '@internet-of-people/sdk';

const content: Types.Sdk.IContent = '{"ajson":"object"}';
const contentId = JsonUtils.digest(content);
```

TODO add Json masking

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
