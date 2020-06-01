import { SecpPrivateKey, Vault, Seed } from '@internet-of-people/morpheus-crypto-wasm';
import {
  // Bip39,
  PersistentVault,
  IMorpheusPublicState,
  hydra,
  IMorpheusContext,
  morpheus,
  XVault,
  Coin,
  IVaultState,
} from '../src';

const dummyMorpheusContext: IMorpheusContext = {
  rewind: async(_parameters: void, _seed: Seed): Promise<IMorpheusPublicState> => {
    return {};
  },
};

describe('Vault BIP44 plugins', () => {
  it('Hydra plugin', async() => {
    // new Bip39('en').generate().phrase
    const vault = await XVault.create(PersistentVault.DEMO_PHRASE, '');
    const account = await hydra(vault, { network: Coin.Hydra.Testnet, account: 0 });

    const pk0 = account.pub.key(0);
    expect(pk0.address).toBe('tjMvaU79mMJ8fKwoLjFLn7rCTthpY6KxTx');
    expect(pk0.path).toBe(`m/44'/1'/0'/0/0`);
    expect(pk0.slip44).toBe(1);
    expect(pk0.account).toBe(0);
    expect(pk0.change).toBe(false);
    expect(pk0.key).toBe(0);

    const priv = await account.priv();

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

  it('Vault can be (de)serialized', async() => {
    let stateString = '';

    const save = async(state: IVaultState): Promise<void> => {
      /* eslint no-undefined: 0 */
      stateString = JSON.stringify(state, undefined, 2);
    };
    const vault = await XVault.create(PersistentVault.DEMO_PHRASE, '', { save });
    const account = await hydra(vault, { network: Coin.Hydra.Testnet, account: 0 });
    const pk1 = account.pub.key(1);

    expect(pk1.address).toBe('tfio7jWgEoZSG16YYqEiU5PxMcxe7HcVph');

    console.log(stateString);

    const vaultRestored = XVault.load(JSON.parse(stateString));
    const accountRestored = await hydra(vaultRestored, { network: Coin.Hydra.Testnet, account: 0 });
    const pk1Restored = accountRestored.pub.key(1);

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
  it.skip('Morpheus plugin', async() => {
    const vault = await XVault.create(PersistentVault.DEMO_PHRASE, '');
    const m = await morpheus(vault, dummyMorpheusContext);

    expect(m.pub.dids()).toHaveLength(0);

    const priv = await m.priv();

    const did = await priv.createDid();
    expect(did.toString()).toBe('did:morpheus:ezBlaa');
    expect(m.pub.dids()).toHaveLength(1);
  });

  it('can be serialized/deserialized', () => {
    const vault = new Vault(PersistentVault.DEMO_PHRASE);
    expect(vault.dids()).toHaveLength(0);

    vault.createDid();
    expect(vault.dids()).toHaveLength(1);

    vault.createDid();
    expect(vault.dids()).toHaveLength(2);
    expect(vault.keyIds().map((id) => {
      return id.toString();
    })).toStrictEqual(
      [ 'iezbeWGSY2dqcUBqT8K7R14xr', 'iez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );
    expect(vault.dids().map((id) => {
      return id.toString();
    })).toStrictEqual(
      [ 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr', 'did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );

    const vaultSerStr = vault.serialize();
    const vaultDeser = Vault.deserialize(vaultSerStr);

    expect(vaultDeser.keyIds().map((id) => {
      return id.toString();
    })).toStrictEqual(vault.keyIds().map((id) => {
      return id.toString();
    }));
  });
});
