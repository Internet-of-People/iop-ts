import { Bip39, Bip44, Seed } from '../src';
import { installWindowCrypto } from './utils';

installWindowCrypto();

describe('Bip39', () => {
  it('can work with phrases', () => {
    const bip39 = new Bip39('en');
    const { phrase } = bip39.generate();
    expect(phrase).toBeTruthy();
    expect(phrase.split(' ')).toHaveLength(24);

    bip39.validatePhrase(phrase);
    expect(() => {
      bip39.validatePhrase(`${phrase}X`);
    }).toThrow();
  });

  it('can create seed', () => {
    const bip39 = new Bip39('en');
    const seed = bip39.phrase(Seed.demoPhrase()).password('');
    const key = Bip44.network(seed, 'HYD testnet').account(0)
      .key(0);
    expect(key.neuter().address).toBe('tjMvaU79mMJ8fKwoLjFLn7rCTthpY6KxTx');
    expect(key.wif).toBe('TVp9Lipzh2e6aXct9vP27QSQtXxCTZHuSjB2wjqtLUoaPrDToYVL');
  });

  it('can list words', () => {
    const bip39 = new Bip39('en');
    const existingWords = bip39.listWords('woo');
    expect(existingWords).toStrictEqual([ 'wood', 'wool' ]);

    const noSuchWords = bip39.listWords('woodoo');
    expect(noSuchWords).toHaveLength(0);
  });

  it('is compatible with short phrases', () => {
    const bip39 = new Bip39('es');
    const phrase = 'reír muestra ceniza médula puerta calle koala gustar ocupar caudal acento nativo';

    bip39.validatePhrase(phrase);
    const seed = bip39.shortPhrase(phrase).password('');

    const key = Bip44.network(seed, 'BTC mainnet').account(0)
      .key(0);
    expect(key.neuter().address).toBe('1vsq3KF4KxAvD2ZRYqXo81KdKUJPDu1Ca');
    expect(key.neuter().publicKey()
      .toString()).toBe('022504d2f2d6d81b0d6cfad4690c028f80a07d5922e7be7e6cddce2dcbef2824ac');
    expect(key.wif).toBe('L5Ng68q8XSdCA2DWXTvrxKjeGWGmq91p6smX5pAH6WHXQgESyZ8R');

    const seed2 = bip39.shortPhrase(phrase).password('plausible deniability');

    const key2 = Bip44.network(seed2, 'BTC testnet').account(0)
      .key(0);
    expect(key2.neuter().address).toBe('mmbgpFrynTvwcA6her9YJ6CmbQWmThswFY');
  });
});
