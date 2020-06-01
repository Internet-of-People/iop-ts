import { Seed } from '@internet-of-people/morpheus-crypto-wasm';
import { IPlugin, IPluginFactory, ITypedPluginFactory, IPluginHolder, TypedPluginState } from '../plugin';
import { IMorpheusPublicState, IMorpheusContext } from './types';
import { MorpheusPublic } from './pub';
import { MorpheusPrivate } from './priv';

export class MorpheusPluginFactory
implements IPluginFactory, ITypedPluginFactory<void, IMorpheusPublicState, MorpheusPublic, MorpheusPrivate> {
  public static instance = new MorpheusPluginFactory();

  public readonly name = 'Morpheus';

  public validate(_parameters: unknown, _state: unknown): void {
    // const p = parameters as void;
    // const s = state as IMorpheusPublicState;
  }

  public createPublic(_state: TypedPluginState<void, IMorpheusPublicState>): MorpheusPublic {
    throw new Error('not implemented');
  }

  public createPrivate(_state: TypedPluginState<void, IMorpheusPublicState>, _seed: Seed): MorpheusPrivate {
    throw new Error('not implemented');
  }
}

export const morpheus = async(
  vault: IPluginHolder,
  context: IMorpheusContext,
): Promise<IPlugin<MorpheusPublic, MorpheusPrivate>> => {
  const parameters = {} as unknown as void;
  const instances = vault.pluginsByName(MorpheusPluginFactory.instance.name);
  let [instance] = instances;

  if (!instance) {
    instance = await vault.createPluginState(
      MorpheusPluginFactory.instance.name,
      parameters,
      async(p, s) => {
        return context.rewind(p, s);
      },
    );
  }
  return vault.createTypedPlugin(MorpheusPluginFactory.instance, instance);
};
