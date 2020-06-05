import { Seed, Morpheus } from '@internet-of-people/morpheus-crypto-wasm';
import { IPlugin, IPluginFactory, ITypedPluginFactory, IPluginHolder, TypedPluginState } from '../plugin';
import { IMorpheusPublicState, IMorpheusContext } from './types';
import { MorpheusPublic } from './pub';
import { MorpheusPrivate } from './priv';

const defaultRewind = async(parameters: void, seed: Seed): Promise<IMorpheusPublicState> => {
  const persona0 = Morpheus.root(seed).personas()
    .key(0)
    .neuter();
  return {
    personas: [persona0.publicKey().toString()],
  };
};

export class MorpheusPluginFactory
implements IPluginFactory, ITypedPluginFactory<void, IMorpheusPublicState, MorpheusPublic, MorpheusPrivate> {
  public static instance = new MorpheusPluginFactory();

  public readonly name = 'Morpheus';

  public validate(_parameters: unknown, _state: unknown): void {
    // const s = state as IMorpheusPublicState;
  }

  public createPublic(state: TypedPluginState<void, IMorpheusPublicState>): MorpheusPublic {
    return new MorpheusPublic(state.publicState);
  }

  public createPrivate(state: TypedPluginState<void, IMorpheusPublicState>, seed: Seed): MorpheusPrivate {
    const root = Morpheus.root(seed);
    return new MorpheusPrivate(state.publicState, state.save, root);
  }
}

export const morpheus = async(
  vault: IPluginHolder,
  context?: IMorpheusContext,
): Promise<IPlugin<MorpheusPublic, MorpheusPrivate>> => {
  const parameters = {} as unknown as void;
  const instances = vault.pluginsByName(MorpheusPluginFactory.instance.name);
  let [instance] = instances;

  if (!instance) {
    const rewind = context?.rewind ?? defaultRewind;
    instance = await vault.createPluginState(
      MorpheusPluginFactory.instance.name,
      parameters,
      rewind,
    );
  }
  return vault.createTypedPlugin(MorpheusPluginFactory.instance, instance);
};
