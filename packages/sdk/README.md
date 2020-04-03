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
    - [Create a DAC Transaction](#Create-a-DAC-Transaction)
  - [Layer-2 Module](#Layer-2-Module)
  - [Crypto Module](#Crypto-Module)
    - [Utility Functions](#Utility-Functions)
    - [In-Memory Vault](#In-Memory-Vault)
    - [Persistent Vault](#Persistent-Vault)
  - [Authority Module](#Authority-Module)
  - [JsonUtils Module](#JsonUtils-Module)
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
import { Authority, Crypto, JsonUtils, Layer1, Layer2, Types, Utils } from '@internet-of-people/sdk';
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

This package contains all Typescript class and utils that you need to interact with the DAC Layer-1 API.

#### Register Before-Proof DAC Transaction

> Until further improvement of this section (and the corresponding SDK itself), please consult the `example` package's code as a real, working guideline.

Note: in these examples we use [Axios](https://www.npmjs.com/package/axios) for http connections.
For more complex examples, such as signed transactions (key & right management) please visit our [Github page](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/examples).

```typescript
// Create a DAC Transaction
import { Identities } from '@arkecosystem/crypto';
import { Layer1, Types } from '@internet-of-people/sdk';
import axios from 'axios';

const api = axios.create({
  'http://test.hydra.iop.global:4703/api/v2',
  headers: { 'Content-Type': 'application/json' },
});

const getWalletNonce = async () => {
  try {
    const resp = await this.api.get(`/wallets/${address}`);
    const nonce = Utils.BigNumber.make(resp.data.data.nonce);
    console.log(`Nonce of ${address} is ${nonce.toFixed()}`);
    return nonce;
  } catch (e) {
    console.log(`Could not get wallet for ${address}, probably a cold wallet.`);
    console.log(`Nonce of ${address} is 0`);
    return Utils.BigNumber.ZERO;
  }
}

const contentId = 'your_content_id';

// Create operations
const opAttempts = new Layer1.OperationAttemptsBuilder()
  .registerBeforeProof(contentId)
  .getAttempts();

// Create a builder
const txBuilder = new Layer1.MorpheusTransactionBuilder();
const unsignedTx = txBuilder.fromOperationAttempts(attempts);

const passphrase = 'your bip38 passphrase';
const publicKey = 'your public key';
const address = Identities.Address.fromPublicKey(publicKey);

// Creating nonce
const nonce = (await getWalletNonce(address)).plus(1);
unsignedTx.nonce(nonce.toFixed());

// Sign transaction
const signedTx = unsignedTx.sign(passphrase).build().toJson();

// At this point you can send the signedTx to the Hydra chain.
await api.post('/transactions', JSON.stringify({ transactions: [signedTx] }));
```

#### Transfer Hydra

TBD

#### Query DID Document

TBD

#### Add and Revoke Key

TBD

#### Add and Revoke Right

TBD

#### Tombstone DID

TBD

### Layer-2 Module

This package contains all Typescript class and utils that you need to interact with the DAC Layer-2 API.

#### Create and Analyze DID Document

TBD

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

// Sign DID operations
vault.signDidOperations(keyId, 'TBD');
```

### Authority Module

Currently contains only one enum, `Status` which describes a possible status for a Witness Request.

### JsonUtils Module

Currently contains only a JSON digest utility, which calculates the ContentId of any content representible as a JSON object.

```typescript
import { JsonUtils, Types } from '@internet-of-people/sdk';

const content: Types.Sdk.IContent = '{"ajson":"object"}';
const contentId = JsonUtils.digest(content);
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
