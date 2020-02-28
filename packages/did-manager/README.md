# Morpheus - DID Manager

This package contains all business logic for Morpheus DID management.
For more info please visit the [specification](https://iop-stack.iop.rocks/dids-and-claims/specification/) or check out the [whitepaper](https://iop.global/whitepaper/).

## Usage

To be able to send Morpheus transactions to the Hydra blockchain, you can use this package as an SDK. 
This SDK will improve over time to be able to use it more easily.

### Install

Put these two packages into your dependencies section in `package.json`:

```json
  ...
  "@internet-of-people/did-manager": "1.0.0",
  "@arkecosystem/crypto": "^2.6.10",
  ...
```

Then you can import it in your Typescript file:

```typescript
import ... from '@internet-of-people/did-manager';
```

### Create a Morpheus Transaction

Note: in these examples we use [Axios](https://www.npmjs.com/package/axios) for http connections.

For more complex examples, such as signed transactions (key & right management) please visit our [Github page](https://github.com/Internet-of-People/morpheus-ts/tree/master/packages/examples).

#### Simple Before Proof

Below you can observe the flow of creating and sending a before proof Morpheus transaction.

```typescript
import { Identities } from '@arkecosystem/crypto';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import axios from 'axios';

const {
  Operations: { OperationAttemptsBuilder },
  Builder: { MorpheusTransactionBuilder },
} = MorpheusTransaction;

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
const opAttempts = new OperationAttemptsBuilder()
  .registerBeforeProof(contentId)
  .getAttempts();

// Create a builder
const txBuilder = new MorpheusTransactionBuilder();
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

## Check also

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/morpheus-ts>