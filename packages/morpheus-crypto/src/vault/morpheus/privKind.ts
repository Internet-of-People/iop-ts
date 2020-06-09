import Optional from 'optional-js';
import {
  Did,
  PrivateKey,
  PublicKey,
  MorpheusKind,
  KeyId,
} from '@internet-of-people/morpheus-crypto-wasm';

import { PublicKeyData } from '../../types';
import { MorpheusPublicKind } from './pubKind';

export class MorpheusPrivateKind {
  public constructor(
    private readonly pubkeyDatas: PublicKeyData[],
    private readonly setDirty: () => void,
    private readonly xsk: MorpheusKind,
    public readonly kind: string,
  ) {}

  public get count(): number {
    return this.pubkeyDatas.length;
  }

  public get pub(): MorpheusPublicKind {
    return new MorpheusPublicKind(this.pubkeyDatas, this.kind);
  }

  public key(idx: number): PrivateKey {
    const oldCount = this.count;

    for (let i = oldCount; i <= idx; ++i) {
      this.pubkeyDatas.push(this.sk(i).publicKey()
        .toString());
    }

    if (oldCount < this.count) {
      this.setDirty();
    }
    return this.sk(idx);
  }

  public did(idx: number): Did {
    const key = this.key(idx);
    return Did.fromKeyId(key.publicKey().keyId());
  }

  public keyById(keyId: KeyId): Optional<PrivateKey> {
    const idx = this.pubkeyDatas.findIndex((pk) => {
      return new PublicKey(pk).validateId(keyId);
    });

    if (idx === -1) {
      return Optional.empty();
    }
    return Optional.of(this.sk(idx));
  }

  private sk(idx: number): PrivateKey {
    return this.xsk.key(idx).privateKey();
  }
}
