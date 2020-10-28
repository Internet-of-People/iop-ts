import * as Crypto from '@internet-of-people/morpheus-crypto';
import { createCoeusApi } from '../src/layer2/api/coeus-api';
// import * as Coeus from '../src/coeus-wasm';
import { Network, NetworkConfig } from '../src/network';
import { installWindowCrypto } from './utils';

installWindowCrypto();

describe('WASM hell', () => {
  it.skip('PublicKey types are the same', async() => {
    const unlockPw = 'correct horse battery staple';
    const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPw);
    Crypto.MorpheusPlugin.rewind(vault, unlockPw);
    const m = Crypto.MorpheusPlugin.get(vault);
    const persona0 = m.priv(unlockPw).personas.key(0);
    const morpheusPk = persona0.neuter().publicKey();

    const client = createCoeusApi(NetworkConfig.fromNetwork(Network.Testnet));
    const nonce = await client.getLastNonce(morpheusPk);

    expect(nonce).toBe(0);
  });
});
