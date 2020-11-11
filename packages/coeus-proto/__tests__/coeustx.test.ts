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
  it('register', () => {
    const secpSk = SecpPrivateKey.fromArkPassphrase(
      'scout try doll stuff cake welcome random taste load town clerk ostrich',
    );
    const secpPk = secpSk.publicKey();
    const sk = PrivateKey.fromSecp(secpSk);
    const pk = sk.publicKey();

    // This is a really bad example of data to register on a blockchain.
    // But it is around 150 bytes and that is what matters.
    const data = JSON.parse(
      '{"firstName":"Sonoo","lastName":"Jaiswal","age":27,' +
      '"address":{"streetAddress":"Plot-6, Mohan Nagar","city":"Ghaziabad","state":"UP","postalCode":"201007"}}',
    );

    const nonced = new NoncedBundleBuilder()
      .add(UserOperation.register(
        new DomainName('.schema.eidcard'),
        Principal.publicKey(pk),
        new SubtreePolicies(),
        data,
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
    expect(tx.fee).toBe('1641000');
    const { asset } = tx;
    expect(asset.bundles[0].nonce).toBe(2);
    expect(asset.bundles[0].publicKey).toBe(pk.toString());
    expect(asset.bundles[0].signature).toBe(
      'ssz6ReSBUL3gsfnpXudgvF4RejqYxF3jTYEcdoHMESXbZS4P2s1kdWgmLBQkLrvTLaHS7pbab3ScFQq65KFyZbELV9x',
    );
    expect(asset.bundles[0].operations[0].name).toStrictEqual('.schema.eidcard');
    expect(asset.bundles[0].operations[0].type).toBe('register');

    const signer = new HydraSigner(secpSk);
    const signedTx: ArkCryptoIf.ITransactionData = signer.signHydraTransaction(tx);

    expect(signedTx.id).toBe('73408bbf68656661eb5a71173d0ca27e8039c4ddc5c497aa8efbb46210acfccb');
    expect(signedTx.signature).toBe(
      '3045' +
      '02210088534201c1b8ed48f31a95a6c9df27784e2d48051e1b3867c5920c73ab3e4e65' +
      '02207d8283a34dc4804e334530768cf4e90dad25ec8f681336142a4f58487d9dc2f7',
    );

    /* eslint-disable-next-line no-undefined */
    console.log(JSON.stringify(signedTx, undefined, 2));
  });

  it('renew', () => {
    const secpSk = SecpPrivateKey.fromArkPassphrase(
      'scout try doll stuff cake welcome random taste load town clerk ostrich',
    );
    const secpPk = secpSk.publicKey();
    const sk = PrivateKey.fromSecp(secpSk);
    const pk = sk.publicKey();

    const nonced = new NoncedBundleBuilder()
      .add(UserOperation.renew(
        new DomainName('.schema.eidcard'),
        69,
      ))
      .build(BigInt(3));
    const signed = nonced.sign(sk);
    expect(signed.verify()).toBeTruthy();

    // TODO where to define Coin.Hydra.Testnet so it can be used here?
    const network = 'HYD testnet';
    const tx: ICoeusData = new CoeusTxBuilder(network)
      .build(signed, secpPk, BigInt(44));

    expect(tx.nonce).toBe('44');
    expect(tx.fee).toBe('1016000');
    const { asset } = tx;
    expect(asset.bundles[0].nonce).toBe(3);
    expect(asset.bundles[0].publicKey).toBe(pk.toString());
    expect(asset.bundles[0].signature).toBe(
      'sszB56HEWfnpNfkJStj3FRqi24Vj4sLicr92iUNXQVtUXCWrVpRiuNb4bUTWgdnfQHQjiPXCWbXCx21n7fdA1mghQtj',
    );
    expect(asset.bundles[0].operations[0].name).toStrictEqual('.schema.eidcard');
    expect(asset.bundles[0].operations[0].type).toBe('renew');

    const signer = new HydraSigner(secpSk);
    const signedTx: ArkCryptoIf.ITransactionData = signer.signHydraTransaction(tx);

    expect(signedTx.id).toBe('5c084a857d9d7fa02097c9ac53acd98aa585bb4c6bbfde00d39d1386bc0c4a66');
    expect(signedTx.signature).toBe(
      '3045' +
      '022100b03ef55ab78fb804ad526f5e0c7ced58239ed7226a27dca0b2c72458d49e98bb' +
      '022025b653855d1a4e31683d705047f416761c2d4e274f3949b30b4d3e707317505e',
    );
  });
});
