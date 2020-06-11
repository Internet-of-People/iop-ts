import {
  Coin,
  HydraPlugin,
  KeyId,
  MorpheusPlugin,
  SecpPrivateKey,
  Seed,
  Vault,
} from '../src';

describe('Vault BIP44 plugins', () => {
  it('Hydra plugin', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', 'an_unlock_password');
    const params = { network: Coin.Hydra.Testnet, account: 0 };
    HydraPlugin.rewind(vault, 'an_unlock_password', params);
    const account = HydraPlugin.get(vault, params);

    const pk0 = account.pub.key(0);
    expect(pk0.address).toBe('tjMvaU79mMJ8fKwoLjFLn7rCTthpY6KxTx');
    expect(pk0.path).toBe(`m/44'/1'/0'/0/0`);
    expect(pk0.slip44).toBe(1);
    expect(pk0.account).toBe(0);
    expect(pk0.change).toBe(false);
    expect(pk0.key).toBe(0);

    const priv = account.priv('an_unlock_password');

    const sk1 = priv.key(1);
    expect(sk1.path).toBe(`m/44'/1'/0'/0/1`);
    expect(sk1.wif).toBe('TajJBkJDEBvBJsvrQj1nxNsiSLYCqmTuHUkhAArA3gDJQm4tnX8u');
    expect(sk1.slip44).toBe(1);
    expect(sk1.account).toBe(0);
    expect(sk1.change).toBe(false);
    expect(sk1.key).toBe(1);
    const data = Uint8Array.from(Buffer.from('Hello world!', 'utf-8'));
    const sig = sk1.privateKey().signEcdsa(data);
    const der = '3045' +
    '022100de69e40e94fb886d53345f87b3b822a30faa17e42d6f7d565da242e12f021349' +
    '0220133dbd61138f1fd490e00ea22bb68e14061eb60c96a400a9dfc83385de834584';
    expect(Buffer.from(sig.toDer()).toString('hex'))
      .toEqual(der);

    const pk1 = sk1.neuter();
    expect(pk1.address).toBe('tfio7jWgEoZSG16YYqEiU5PxMcxe7HcVph');
    expect(pk1.path).toBe(`m/44'/1'/0'/0/1`);

    expect(pk1.publicKey().validateEcdsa(data, sig)).toBeTruthy();
  });

  it('Vault can be (de)serialized', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', 'an_unlock_password');
    const params = { network: Coin.Hydra.Testnet, account: 0 };
    HydraPlugin.rewind(vault, 'an_unlock_password', params);
    const account = HydraPlugin.get(vault, params);
    const pk1 = account.pub.key(1);

    expect(pk1.address).toBe('tfio7jWgEoZSG16YYqEiU5PxMcxe7HcVph');

    expect(vault.dirty).toBe(true);
    /* eslint no-undefined: 0 */
    const stateString = JSON.stringify(vault.save(), undefined, 2);
    expect(vault.dirty).toBe(false);

    console.log(stateString);

    // Notice how unlockPassword is not needed to use the public API
    const vaultRestored = Vault.load(JSON.parse(stateString));
    const accountRestored = HydraPlugin.get(vaultRestored, { network: Coin.Hydra.Testnet, account: 0 });
    const pk1Restored = accountRestored.pub.key(1);
    expect(vaultRestored.dirty).toBe(false);

    expect(pk1Restored.address).toBe('tfio7jWgEoZSG16YYqEiU5PxMcxe7HcVph');
  });

  // TODO Currently we do not have the transaction serializer in morpheus-crypto-wasm, therefore we would have to
  // rely on @ark-ecosystem/crypto to build the transfer transaction object...
  it.skip('ARK passphrase', () => {
    const phrase = 'scout try doll stuff cake welcome random taste load town clerk ostrich';
    const sig = '3044' +
    '02207a0f32cc466b820ca9f76fbe595f7ac091144b89a7a9ff75df6f55ad17d4e311' +
    '02204e1123a2741e1dee12ad985b194b2ed600ecad0765f2d3f2c6c18e46b0c3fce0';
    const sk = SecpPrivateKey.fromArkPassphrase(phrase);
    const transfer = {
      transactions: [
        {
          version: 2,
          network: 128,
          typeGroup: 1,
          type: 0,
          nonce: 69,
          senderPublicKey: '03d4bda72219264ff106e21044b047b6c6b2c0dde8f49b42c848e086b97920adbf',
          fee: 10000000,
          amount: 100000000,
          recipientId: 'tjseecxRmob5qBS2T3qc8frXDKz3YUGB8J',
          id: 'b9e4c443071c166ca76a225a55e193deff837c5168818b715f5221b66e6f302c',
          signature: sig,
        },
      ],
    };
    sk.signEcdsa(Uint8Array.from(Buffer.from(JSON.stringify(transfer), 'utf-8')));
  });
});

describe('Vault Morpheus plugin', () => {
  it('Morpheus plugin', () => {
    const unlockPassword = 'an_unlock_password';
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    MorpheusPlugin.rewind(vault, unlockPassword);
    const m = MorpheusPlugin.get(vault);

    const { personas } = m.pub;
    expect(personas.count).toBe(1);
    expect(personas.key(0).toString()).toBe('pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6');
    expect(personas.did(0).toString()).toBe('did:morpheus:ezqztJ6XX6GDxdSgdiySiT3J');
    expect(() => {
      return personas.key(1);
    }).toThrow();

    const priv = m.priv(unlockPassword);

    const maybeSk = priv.personas.keyById(new KeyId('iezqztJ6XX6GDxdSgdiySiT3J'));
    expect(maybeSk.isPresent()).toBeTruthy();
    const sk = maybeSk.get();
    expect(sk.publicKey().toString()).toBe('pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6');
  });

  it('can be serialized/deserialized', () => {
    const unlockPassword = 'an_unlock_password';
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    MorpheusPlugin.rewind(vault, unlockPassword);
    const m = MorpheusPlugin.get(vault);
    expect(m.pub.personas.count).toBe(1);

    const priv = m.priv(unlockPassword);

    const sk = priv.personas.key(2);
    expect(sk.publicKey().toString()).toBe('pezsfLDb1fngso3J7TXU6jP3nSr2iubcJZ4KXanxrhs9gr');

    expect(vault.dirty).toBe(true);

    /* eslint no-undefined: 0 */
    const stateString = JSON.stringify(vault.save(), undefined, 2);
    expect(vault.dirty).toBe(false);

    console.log(stateString);

    // Notice how unlockPassword is not needed to use the public API
    const vaultRestored = Vault.load(JSON.parse(stateString));
    const mRestored = MorpheusPlugin.get(vaultRestored);
    const pk1Restored = mRestored.pub.personas.key(2);

    expect(vaultRestored.dirty).toBe(false);
    expect(pk1Restored.toString()).toBe('pezsfLDb1fngso3J7TXU6jP3nSr2iubcJZ4KXanxrhs9gr');
  });
});
