import { Seed, Morpheus } from '@internet-of-people/morpheus-crypto-wasm';

import { IPluginFactory, ITypedPluginFactory, TypedPluginState } from '../plugin';
import { IMorpheusParameters, IMorpheusPublicState } from './types';
import { MorpheusPublic } from './pub';
import { MorpheusPrivate } from './priv';

export class MorpheusPluginFactory implements
  IPluginFactory,
  ITypedPluginFactory<IMorpheusParameters, IMorpheusPublicState, MorpheusPublic, MorpheusPrivate> {
  public static instance = new MorpheusPluginFactory();

  public readonly name = 'Morpheus';

  public validate(_parameters: unknown, _state: unknown): void {
    // const s = state as IMorpheusPublicState;
  }

  public createPublic(
    state: TypedPluginState<IMorpheusParameters, IMorpheusPublicState>,
  ): MorpheusPublic {
    return new MorpheusPublic(state.publicState);
  }

  public createPrivate(
    state: TypedPluginState<IMorpheusParameters, IMorpheusPublicState>,
    seed: Seed,
  ): MorpheusPrivate {
    const root = Morpheus.root(seed);
    return new MorpheusPrivate(state.publicState, state.setDirty, root);
  }
}
