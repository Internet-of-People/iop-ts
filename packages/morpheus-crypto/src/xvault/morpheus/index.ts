import { Did, KeyId, Seed } from '@internet-of-people/morpheus-crypto-wasm';
import { IPlugin, IPluginFactory, ITypedPluginFactory, IPluginHolder, IPluginState, TypedPluginState } from '../plugin';

export interface IMorpheusContext {
  rewind(parameters: void, seed: Seed): Promise<IMorpheusPublicState>;
}

export interface IMorpheusPublicState { }

export class MorpheusPluginFactory implements IPluginFactory, ITypedPluginFactory<void, IMorpheusPublicState, MorpheusPublic, MorpheusPrivate> {
  readonly name = 'Morpheus';

  validate(parameters: unknown, state: unknown): void {
    const p = parameters as void;
    const s = state as IMorpheusPublicState;
  }

  createPublic(state: TypedPluginState<void, IMorpheusPublicState>): MorpheusPublic {
    throw new Error('not implemented');
  }

  createPrivate(state: TypedPluginState<void, IMorpheusPublicState>, seed: Seed): MorpheusPrivate {
    throw new Error('not implemented');
  }

  public static instance = new MorpheusPluginFactory();
}

export const morpheus = async(vault: IPluginHolder, context: IMorpheusContext): Promise<IPlugin<MorpheusPublic, MorpheusPrivate>> => {
  const parameters = {} as unknown as void;
  const instances = vault.pluginsByName(MorpheusPluginFactory.instance.name);
  let instance: IPluginState | null = null;

  if (instances.length) {
    instance = instances[0];
  }

  if (!instance) {
    instance = await vault.createPluginState(
      MorpheusPluginFactory.instance.name,
      parameters,
      (parameters, seed) => {
        return context.rewind(parameters, seed);
      },
    );
  }
  return vault.createTypedPlugin(MorpheusPluginFactory.instance, instance);
};

export class MorpheusPublic {
  keyIds(): KeyId[] {
    throw new Error('not implemented');
  }

  dids(): Did[] {
    throw new Error('not implemented');
  }
}

export class MorpheusPrivate {
  public async createDid(): Promise<Did> {
    throw new Error('Method not implemented.');
  }
}
