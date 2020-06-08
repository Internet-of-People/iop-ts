import { Seed, Morpheus } from '@internet-of-people/morpheus-crypto-wasm';
import { IPlugin, IPluginFactory, ITypedPluginFactory, IPluginHolder, TypedPluginState } from '../plugin';
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

export const morpheusDefaultRewind = (
  vault: IPluginHolder,
  unlockPassword: string,
  parameters: IMorpheusParameters,
): void => {
  const seed = vault.unlock(unlockPassword);
  const persona0 = Morpheus.root(seed).personas()
    .key(0)
    .neuter();
  const state: IMorpheusPublicState = {
    personas: [persona0.publicKey().toString()],
  };
  vault.createPluginState(MorpheusPluginFactory.instance.name, parameters, state);
};

export const morpheus = async(
  vault: IPluginHolder,
): Promise<IPlugin<MorpheusPublic, MorpheusPrivate>> => {
  const instances = vault.pluginsByName(MorpheusPluginFactory.instance.name);
  const [instance] = instances;

  if (!instance) {
    throw new Error(`Could not find Morpheus`);
  }
  return vault.createTypedPlugin(MorpheusPluginFactory.instance, instance);
};
