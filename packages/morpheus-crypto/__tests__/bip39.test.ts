import { Bip39, PersistentVault, Bip44 } from '../src';

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
    const seed = bip39.phrase(PersistentVault.DEMO_PHRASE).password('');
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
});
