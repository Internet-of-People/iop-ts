import { Crypto } from '../src';

import { installWindowCrypto } from './utils';

installWindowCrypto();
const unlockPassword = 'correct horse battery staple';

describe('jwt', () => {
  it('builds and parses token', () => {
    const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPassword);
    const params = new Crypto.HydraParameters(Crypto.Coin.Hydra.Testnet, 0);
    Crypto.HydraPlugin.init(vault, unlockPassword, params);
    const account = Crypto.HydraPlugin.get(vault, params);
    const key = account.priv(unlockPassword).key(0);
    const { address } = key.neuter();
    expect(address).toBe('tjMvaU79mMJ8fKwoLjFLn7rCTthpY6KxTx');
    const pk = key.neuter().publicKey();

    const sk = Crypto.PrivateKey.fromSecp(key.privateKey());
    const token = Crypto.JwtBuilder.withContentId('Could be anything, really').sign(sk);

    const parsed = new Crypto.JwtParser(token);
    expect(parsed.publicKey.toString()).toBe(Crypto.PublicKey.fromSecp(pk).toString());
  });
});
