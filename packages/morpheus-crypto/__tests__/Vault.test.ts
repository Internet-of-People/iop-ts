import {
  allNetworkNames,
  Coin,
  HydraParameters,
  HydraPlugin,
  HydraSigner,
  HydraTxBuilder,
  KeyId,
  MorpheusPlugin,
  SecpKeyId,
  Seed,
  Vault,
} from '../src';
import { installWindowCrypto } from './utils';

installWindowCrypto();
const unlockPassword = 'correct horse battery staple';

it('Check list of networks', () => {
  const networks = allNetworkNames();
  expect(networks).toContain('HYD mainnet');
  expect(networks).toContain('ARK devnet');
  expect(networks).toContain('BTC testnet');
  expect(networks).toContain('IOP testnet'); // This is the deprecated PoW-PoA hybrid network replaced by hydraledger.io
});

describe('Vault BIP44 plugins', () => {
  it('Hydra plugin', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    const params = new HydraParameters(Coin.Hydra.Testnet, 0);
    HydraPlugin.init(vault, unlockPassword, params);
    const account = HydraPlugin.get(vault, params);

    const pk0 = account.pub.key(0);
    expect(pk0.address).toBe('tjMvaU79mMJ8fKwoLjFLn7rCTthpY6KxTx');
    expect(pk0.path).toBe(`m/44'/1'/0'/0/0`);
    expect(pk0.slip44).toBe(1);
    expect(pk0.account).toBe(0);
    expect(pk0.change).toBe(false);
    expect(pk0.key).toBe(0);

    const priv = account.priv(unlockPassword);

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
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    const params = new HydraParameters(Coin.Hydra.Testnet, 0);
    HydraPlugin.init(vault, unlockPassword, params);
    const account = HydraPlugin.get(vault, params);
    const pk1 = account.priv(unlockPassword).key(1);

    expect(pk1.neuter().address).toBe('tfio7jWgEoZSG16YYqEiU5PxMcxe7HcVph');

    expect(vault.dirty).toBe(true);
    /* eslint no-undefined: 0 */
    const stateString = JSON.stringify(vault.save(), undefined, 2);
    expect(vault.dirty).toBe(false);

    // console.log(stateString);

    // Notice how unlockPassword is not needed to use the public API
    const vaultRestored = Vault.load(JSON.parse(stateString));
    const accountRestored = HydraPlugin.get(vaultRestored, params);
    const pk1Restored = accountRestored.pub.key(1);

    expect(vaultRestored.dirty).toBe(false);

    expect(pk1Restored.address).toBe('tfio7jWgEoZSG16YYqEiU5PxMcxe7HcVph');
  });

  it('Vault can sign Hydra transactions', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    const params = new HydraParameters(Coin.Hydra.Testnet, 0);
    HydraPlugin.init(vault, unlockPassword, params);
    const account = HydraPlugin.get(vault, params);

    const bip44Key = account.priv(unlockPassword).key(0);
    const sk = bip44Key.privateKey();
    const pk = sk.publicKey();
    const signer = new HydraSigner(sk);

    const { network } = bip44Key;
    const builder = new HydraTxBuilder(network);

    // const recipient = pk.arkKeyId();
    const recipient = SecpKeyId.fromAddress('tjseecxRmob5qBS2T3qc8frXDKz3YUGB8J', network);
    const transfer = builder.transfer(recipient, pk, BigInt(100000000), BigInt(69));
    expect(JSON.stringify(transfer, null, 2)).toBe(
      '{\n' +
      '  "version": 2,\n' +
      '  "network": 128,\n' +
      '  "typeGroup": 1,\n' +
      '  "type": 0,\n' +
      '  "nonce": "69",\n' +
      '  "senderPublicKey": "02db11c07afd6ec05980284af58105329d41e9882947188022350219cca9baa3e7",\n' +
      '  "fee": "10000000",\n' +
      '  "amount": "100000000",\n' +
      '  "recipientId": "tjseecxRmob5qBS2T3qc8frXDKz3YUGB8J"\n' +
      '}');

    const signedTransfer = signer.signHydraTransaction(transfer);

    expect(signedTransfer.id).toBe('b82eb0a55edc52f6700f7ca8bcf77d24491f9b256e98f2655d1943ae6f36d998');
    expect(signedTransfer.signature).toBe(
      '3045' +
      '022100daabffa197f8eab8540c8c010f99b1cea3378ecad5c683c0792861f38270be69' +
      '02203e4146b141234d028a44398cb0edc2c2e768e95ca0d7a8996c39c3764ed95a8f',
    );

    const vote = builder.vote(pk, pk, BigInt(69));
    expect(JSON.stringify(vote, null, 2)).toBe(
      '{\n' +
      '  "version": 2,\n' +
      '  "network": 128,\n' +
      '  "typeGroup": 1,\n' +
      '  "type": 3,\n' +
      '  "asset": {\n' +
      '    "votes": [\n' +
      '      "+02db11c07afd6ec05980284af58105329d41e9882947188022350219cca9baa3e7"\n' +
      '    ]\n' +
      '  },\n' +
      '  "nonce": "69",\n' +
      '  "senderPublicKey": "02db11c07afd6ec05980284af58105329d41e9882947188022350219cca9baa3e7",\n' +
      '  "fee": "100000000",\n' +
      '  "amount": "0"\n' +
      '}');

    const signedVote = signer.signHydraTransaction(vote);

    expect(signedVote.id).toBe('5906c4029b4af11951e87db86214250843fb56bb35a7436fbbe8bf59209102b2');
    expect(signedVote.signature).toBe(
      '3045' +
      '022100e58086aadc80b23d5f61ad83de83802e6c75ecd6a9ce611f0409fbeb67dd9762' +
      '0220125712f47c5147348fc934e14bcb7b73109149d5ed466d63bb20b948d728fb93',
    );
  });
});

describe('Vault Morpheus plugin', () => {
  it('Morpheus plugin', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    MorpheusPlugin.init(vault, unlockPassword);
    const m = MorpheusPlugin.get(vault);

    const { personas } = m.pub;
    expect(personas.count).toBe(1);
    expect(personas.key(0).toString()).toBe('pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6');
    expect(personas.did(0).toString()).toBe('did:morpheus:ezqztJ6XX6GDxdSgdiySiT3J');
    expect(() => {
      return personas.key(1);
    }).toThrow();

    const priv = m.priv(unlockPassword);

    expect(priv.path).toBe('m/128164\'');
    expect(priv.personas.path).toBe('m/128164\'/0\'');
    expect(priv.devices.path).toBe('m/128164\'/1\'');
    expect(priv.groups.path).toBe('m/128164\'/2\'');
    expect(priv.resources.path).toBe('m/128164\'/3\'');

    const pk = priv.pub.keyById(new KeyId('iezqztJ6XX6GDxdSgdiySiT3J'));
    expect(pk.toString()).toBe('pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6');
    const sk = priv.keyByPublicKey(pk);
    expect(sk.kind).toBe('Persona');
    expect(sk.idx).toBe(0);
  });

  it('can be serialized/deserialized', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    MorpheusPlugin.init(vault, unlockPassword);
    const m = MorpheusPlugin.get(vault);
    expect(m.pub.personas.count).toBe(1);

    const priv = m.priv(unlockPassword);

    const sk = priv.personas.key(2);
    expect(sk.neuter().publicKey()
      .toString()).toBe('pezsfLDb1fngso3J7TXU6jP3nSr2iubcJZ4KXanxrhs9gr');

    expect(vault.dirty).toBe(true);

    /* eslint no-undefined: 0 */
    const stateString = JSON.stringify(vault.save(), undefined, 2);
    expect(vault.dirty).toBe(false);

    // console.log(stateString);

    // Notice how unlockPassword is not needed to use the public API
    const vaultRestored = Vault.load(JSON.parse(stateString));
    const mRestored = MorpheusPlugin.get(vaultRestored);
    const pk1Restored = mRestored.pub.personas.key(2);

    expect(vaultRestored.dirty).toBe(false);
    expect(pk1Restored.toString()).toBe('pezsfLDb1fngso3J7TXU6jP3nSr2iubcJZ4KXanxrhs9gr');
  });
});
