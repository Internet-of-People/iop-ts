import { Interfaces as ArkCryptoIf } from '@arkecosystem/crypto';
import {
  CoeusTxBuilder,
  DomainName,
  HydraSigner,
  NoncedBundleBuilder,
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

    const nonced = new NoncedBundleBuilder()
      .add(UserOperation.register(
        new DomainName('.schema.eidcard'),
        Principal.publicKey(pk),
        new SubtreePolicies(),
        {},
        69,
      ))
      .build(BigInt(2));
    const signed = nonced.sign(sk);
    expect(signed.verify()).toBeTruthy();

    // TODO where to define Coin.Hydra.Testnet so it can be used here?
    const network = 'HYD testnet';
    const tx: ICoeusData = new CoeusTxBuilder(network)
      .build(signed, secpPk, BigInt(42));

    expect(tx.nonce).toBe('42');
    const { asset } = tx;
    expect(asset.bundles[0].nonce).toBe(2);
    expect(asset.bundles[0].publicKey).toBe(pk.toString());
    expect(asset.bundles[0].signature).toBe(
      'sszAdT1rPBbNSAHAdAAtsPZU56Dz5wieFSq5W1M1R3p3jRHBKf9pWw8zUshJhzGKjW1mF9yTB8HUz8fRwJiRZBiyQMb',
    );
    expect(asset.bundles[0].operations[0].name).toStrictEqual('.schema.eidcard');
    expect(asset.bundles[0].operations[0].type).toBe('register');

    const signer = new HydraSigner(secpSk);
    const signedTx: ArkCryptoIf.ITransactionData = signer.signHydraTransaction(tx);

    expect(signedTx.id).toBe('a9c27db41e16907f05a46dd0796da34d5526b17cd0196cc0b59ececa4270ca32');
    expect(signedTx.signature).toBe(
      '3045' +
      '02210097ee1971a0e74de39f10ae0ead44f10aa82214b699fe3b6caa5a443bb7b3b144' +
      '02204e71593d42daf828d59e90bed60664fc87ad91989264c1cd9d4c79d42af84aa8',
    );

    /* eslint-disable-next-line no-undefined */
    console.log(JSON.stringify(signedTx, undefined, 2));
  });
});
