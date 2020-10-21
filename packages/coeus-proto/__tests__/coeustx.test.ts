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
        Principal.publicKey(pk),
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
      'sszAdT1rPBbNSAHAdAAtsPZU56Dz5wieFSq5W1M1R3p3jRHBKf9pWw8zUshJhzGKjW1mF9yTB8HUz8fRwJiRZBiyQMb',
    );
    expect(asset.signedOperations[0].operations[0].name).toStrictEqual('.schema.eidcard');
    expect(asset.signedOperations[0].operations[0].type).toBe('register');

    const signer = new HydraSigner(secpSk);
    const signedTx: ArkCryptoIf.ITransactionData = signer.signHydraTransaction(tx);

    expect(signedTx.id).toBe('312eed2e721591e4e2bb7296cc67aea7863a7bbebb0e06d2641544e9327f24b5');
    expect(signedTx.signature).toBe(
      '3044' +
      '0220091de0b166c4df5e9c64cdbadeb92b5a8e90a4c828440c6a5a6a34b9ee89583c' +
      '0220334e185fa3de9500edf9553fd26808717c1617009813bbc0f7bad010a49e34e0',
    );

    /* eslint-disable-next-line no-undefined */
    console.log(JSON.stringify(signedTx, undefined, 2));
  });
});
