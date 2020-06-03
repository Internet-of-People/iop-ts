import Optional from 'optional-js';
import { Did, KeyId, PublicKey } from '@internet-of-people/morpheus-crypto-wasm';

import { PublicKeyData } from '../../types';

export class MorpheusPublicKind {
  public constructor(
    private readonly pubkeyDatas: PublicKeyData[],
    public readonly kind: string,
  ) {}

  public get count(): number {
    return this.pubkeyDatas.length;
  }

  public get keys(): PublicKey[] {
    return this.pubkeyDatas.map((pk) => {
      return new PublicKey(pk);
    });
  }

  public keyIds(): KeyId[] {
    return this.keys.map((pk) => {
      return pk.keyId();
    });
  }

  public dids(): Did[] {
    return this.keyIds().map((id) => {
      return Did.fromKeyId(id);
    });
  }

  public key(idx: number): PublicKey {
    return new PublicKey(this.pubkeyDatas[idx]);
  }

  public did(idx: number): Did {
    return Did.fromKeyId(this.key(idx).keyId());
  }

  public keyById(keyId: KeyId): Optional<PublicKey> {
    for (const data of this.pubkeyDatas) {
      const pk = new PublicKey(data);

      if (pk.validateId(keyId)) {
        return Optional.of(pk);
      }
    }
    return Optional.empty();
  }
}
