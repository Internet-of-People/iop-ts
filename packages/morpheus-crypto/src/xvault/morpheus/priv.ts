import {
  MorpheusRoot, KeyId, SignedBytes, PrivateKey
} from '@internet-of-people/morpheus-crypto-wasm';

import { IMorpheusPublicState } from './types';
import { MorpheusPrivateKind } from './privKind';
import { IMorpheusSigner } from '../../types';

export class MorpheusPrivate implements IMorpheusSigner {
  public readonly personas: MorpheusPrivateKind;

  public constructor(state: IMorpheusPublicState, save: () => Promise<void>, root: MorpheusRoot) {
    this.personas = new MorpheusPrivateKind(state.personas, save, root.personas(), 'Persona');
  }

  public signDidOperations(id: KeyId, message: Uint8Array): SignedBytes {
    let sk = this.signerByAuth(id);
    let sig = sk.signEcdsa(message);
    return new SignedBytes(sk.publicKey(), message, sig);
  }

  private signerByAuth(id: KeyId): PrivateKey {
    let maybeSk = this.personas.keyById(id);
    let sk = maybeSk.orElseThrow(() => new Error(`Key ${id} is not owned by this vault`));
    return sk;
  }
}
