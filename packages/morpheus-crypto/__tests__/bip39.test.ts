import { Bip39 } from '../src';

describe('Bip39', () => {
  it('can work with phrases', () => {
    const bip39 = new Bip39('en');
    const phrase = bip39.generatePhrase();
    expect(phrase).toBeTruthy();
    expect(phrase.split(' ')).toHaveLength(24);

    bip39.validatePhrase(phrase);
    expect(() => {
      bip39.validatePhrase(`${phrase }X`);
    }).toThrow();
  });

  it('can list words', () => {
    const bip39 = new Bip39('en');
    const existingWords = bip39.listWords('woo');
    expect(existingWords).toStrictEqual([ 'wood', 'wool' ]);

    const noSuchWords = bip39.listWords('woodoo');
    expect(noSuchWords).toHaveLength(0);
  });
});
