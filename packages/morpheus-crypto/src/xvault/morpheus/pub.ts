import { IMorpheusPublicState } from './types';
import { MorpheusPublicKind } from './pubKind';

export class MorpheusPublic {
  public readonly personas: MorpheusPublicKind;

  public constructor(state: IMorpheusPublicState) {
    this.personas = new MorpheusPublicKind(state.personas, 'Persona');
  }
}
