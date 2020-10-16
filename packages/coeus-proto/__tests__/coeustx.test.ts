import { Interfaces as ArkCryptoIf } from '@arkecosystem/crypto';
import {
  CoeusTxBuilder,
  DomainName,
  HydraSigner,
  NoncedOperationsBuilder,
  UserOperation,
  Principal,
  PrivateKey,
  SecpPrivateKey,
  SubtreePolicies,
} from '@internet-of-people/sdk-wasm';

import { ICoeusData } from '../src';

describe('CoeusTransaction builder', () => {
  it('blah', () => {
    const secpSk = SecpPrivateKey.fromArkPassphrase(
      'scout try doll stuff cake welcome random taste load town clerk ostrich',
    );
    const secpPk = secpSk.publicKey();
    const sk = PrivateKey.fromSecp(secpSk);
    const pk = sk.publicKey();

    const noncedOps = new NoncedOperationsBuilder()
      .add(UserOperation.register(
        new DomainName('.schema.eidcard'),
        Principal.publicKey(pk.toString()),
        new SubtreePolicies(),
        {},
        69,
      ))
      .build(BigInt(2));
    const signedOps = noncedOps.sign(sk);
    expect(signedOps.verify()).toBeTruthy();

    // TODO where to define Coin.Hydra.Testnet so it can be used here?
    const network = 'HYD testnet';
    const tx: ICoeusData = new CoeusTxBuilder(network)
      .build(signedOps, secpPk, BigInt(42));

    expect(tx.nonce).toBe('42');
    const { asset } = tx;
    expect(asset.signedOperations[0].nonce).toBe(2);
    expect(asset.signedOperations[0].publicKey).toBe(pk.toString());
    expect(asset.signedOperations[0].signature).toBe(
      'ssz7ju84s3XedrTZhATxKEVLZjws79hVpjtnvZyhxDasWMuRWQd7eJZrWzLNeN982YgAyU62RBMchrrYWzrb2eiCHxJ',
    );
    expect(asset.signedOperations[0].operations[0].name).toStrictEqual([ 'schema', 'eidcard' ]);
    expect(asset.signedOperations[0].operations[0].type).toBe('register');

    const signer = new HydraSigner(secpSk);
    const signedTx: ArkCryptoIf.ITransactionData = signer.signHydraTransaction(tx);

    expect(signedTx.id).toBe('5992ccc7e284de55d2720d8f7704588051b049b20d3dc26b21b61a03e2a457bc');
    expect(signedTx.signature).toBe(
      '3044' +
      '02207818326a5ae380810fda64f39a1e617cf65cdd015d2a8c07f3092dd3cd15ad00' +
      '02207d294c480c30dcad3941657cae07a6c0f26a17f2cb71f9340e56b7755fa5d623',
    );

    /* eslint-disable-next-line no-undefined */
    console.log(JSON.stringify(signedTx, undefined, 2));
  });
});
