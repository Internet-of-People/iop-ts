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
      'ssz7ju84s3XedrTZhATxKEVLZjws79hVpjtnvZyhxDasWMuRWQd7eJZrWzLNeN982YgAyU62RBMchrrYWzrb2eiCHxJ',
    );
    expect(asset.signedOperations[0].operations[0].name).toStrictEqual([ 'schema', 'eidcard' ]);
    expect(asset.signedOperations[0].operations[0].type).toBe('register');

    const signer = new HydraSigner(secpSk);
    const signedTx: ArkCryptoIf.ITransactionData = signer.signHydraTransaction(tx);

    expect(signedTx.id).toBe('36143d1257a942b20dc43fd73c22ffdfe3a58dc1533019debd6d8c77108d45ca');
    expect(signedTx.signature).toBe(
      '3045' +
      '022100d971ef27f5790511b51793710a87590e1bbb6cb3c66c28846d56ccd5beaf9033' +
      '02207bc936ca2e9ea22b3dd4758798355a25306ca3003860b9a52b6e73d453409ac2',
    );

    /* eslint-disable-next-line no-undefined */
    console.log(JSON.stringify(signedTx, undefined, 2));
  });
});
