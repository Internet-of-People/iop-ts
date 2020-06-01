import { Did, KeyId } from '@internet-of-people/morpheus-crypto-wasm';

export class MorpheusPublic {
  public keyIds(): KeyId[] {
    throw new Error('not implemented');
  }

  public dids(): Did[] {
    throw new Error('not implemented');
  }
}
