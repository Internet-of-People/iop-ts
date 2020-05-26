import { Bip44, Bip44Account, Seed } from '@internet-of-people/morpheus-crypto-wasm';

import { IPlugin, IPluginFactory, ITypedPluginFactory, IPluginHolder, TypedPluginState } from '../plugin';
import { IHydraContext, IHydraParameters, IHydraPublicState } from './types';
import { HydraAccountPublic } from './pub';
import { HydraAccountPrivate } from './priv';

export class HydraPluginFactory implements IPluginFactory, ITypedPluginFactory<IHydraParameters, IHydraPublicState, HydraAccountPublic, HydraAccountPrivate> {
  readonly name = 'Hydra';

  validate(parameters: unknown, state: unknown): void {
    const p = parameters as IHydraParameters;
    const s = state as IHydraPublicState;
  }

  createPublic(state: TypedPluginState<IHydraParameters, IHydraPublicState>): HydraAccountPublic {
    return new HydraAccountPublic(state);
  }

  createPrivate(state: TypedPluginState<IHydraParameters, IHydraPublicState>, seed: Seed): HydraAccountPrivate {
    const bip44Account = this.createAccount(state.parameters, seed);
    return new HydraAccountPrivate(bip44Account, state);
  }

  public createAccount(parameters: IHydraParameters, seed: Seed): Bip44Account {
    return Bip44.network(seed, parameters.network).account(parameters.account);
  }

  public static instance = new HydraPluginFactory();
}

const defaultRewind = async (parameters: IHydraParameters, seed: Seed): Promise<IHydraPublicState> => {
  const account = HydraPluginFactory.instance.createAccount(parameters, seed);
  const pk = account.neuter();
  const state: IHydraPublicState = { xpub: pk.xpub, count: 1 };
  return state;
};

export const hydra = async(vault: IPluginHolder, parameters: IHydraParameters, context?: IHydraContext): Promise<IPlugin<HydraAccountPublic, HydraAccountPrivate>> => {
  // if (...parameters.network) {
  //   throw new Error(`Network ${parameters.network} is not known`);
  // }
  if (!Number.isSafeInteger(parameters.account) && parameters.account >= 0) {
    throw new Error('Account index must be a non-negative integer');
  }

  const instances = vault.pluginsByName(HydraPluginFactory.instance.name);
  let instance = instances.find((p) => {
    const h = p.parameters as IHydraParameters;
    return h.network === parameters.network &&
      h.account === parameters.account;
  });

  if (!instance) {
    const rewind = context?.rewind ?? defaultRewind;
    instance = await vault.createPluginState(
      HydraPluginFactory.instance.name,
      parameters,
      rewind,
    );
  }
  return vault.createTypedPlugin(HydraPluginFactory.instance, instance);
};
