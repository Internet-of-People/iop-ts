import {
  MorpheusRoot,
} from '@internet-of-people/morpheus-crypto-wasm';

import { IMorpheusPublicState } from './types';
import { MorpheusPrivateKind } from './privKind';

export class MorpheusPrivate {
  public readonly personas: MorpheusPrivateKind;

  public constructor(state: IMorpheusPublicState, save: () => Promise<void>, root: MorpheusRoot) {
    this.personas = new MorpheusPrivateKind(state.personas, save, root.personas(), 'Persona');
  }
}
