import { randomBytes } from 'crypto';

import { Bip39 as WasmBip39 } from '@internet-of-people/morpheus-crypto-wasm';

export class Bip39 {
  private readonly wrapped: WasmBip39;

  /**
   * Creates a new BIP39 generator/validator with the specified language.
   *
   * @param {string} langCode Language of the mnemonic (en, zh-hans, zh-hant, fr, it, ja, ko, es)
   *    Check the list of languages at
   * https://github.com/maciejhirsz/tiny-bip39/blob/a451ee899fa3d06b42076a9d3f69e632c04b93c0/src/language.rs#L138
   */
  public constructor(langCode: string) {
    this.wrapped = new WasmBip39(langCode);
  }

  /**
   * @returns {string} New 24-word mnemonic phrase in the selected language
   */
  public generatePhrase(): string {
    const entropy = randomBytes(256 / 8);
    return this.wrapped.generatePhrase(Uint8Array.from(entropy));
  }

  /**
   * Checks if the phrase contains only valid words, has the right size and the checksum is also valid.
   * If any of these fail, an exception will be thrown.
   * @param {string} phrase
   */
  public validatePhrase(phrase: string): void {
    this.wrapped.validatePhrase(phrase);
  }

  /**
   * Lists all the possible mnemonic words that start with the given prefix. It can be used to list
   * all words (empty prefix), for autocompletion (prefix is what the user typed so far) or validation
   * of a single word (prefix is the full word, if result is empty, word is invalid)-
   * @param {string} prefix
   * @returns {string[]}
   */
  public listWords(prefix: string): string[] {
    return this.wrapped.listWords(prefix);
  }
}
