import { Bip44, Bip44Account, Seed, Bip44PublicAccount } from '@internet-of-people/morpheus-crypto-wasm';

import { IPlugin, IPluginFactory, ITypedPluginFactory, IPluginHolder, TypedPluginState } from '../plugin';
import { IHydraParameters, IHydraPublicState } from './types';

export class HydraPluginFactory implements
  IPluginFactory,
  ITypedPluginFactory<IHydraParameters, IHydraPublicState, Bip44PublicAccount, Bip44Account> {
  public static instance = new HydraPluginFactory();

  public readonly name = 'Hydra';

  public validate(parameters: unknown, state: unknown): void {
    const p = parameters as IHydraParameters;

    if (typeof p.network !== 'string') {
      throw new Error(`Network name must be a string.`);
    }
    const idx = p.account;

    if (!Number.isSafeInteger(idx) || idx < 0 || idx >= Math.pow(2, 31)) {
      throw new Error(`Account number ${idx} is invalid.`);
    }
    const s = state as IHydraPublicState;
    this.createXpk(p, s);
  }

  public createPublic(
    state: TypedPluginState<IHydraParameters, IHydraPublicState>,
  ): Bip44PublicAccount {
    return this.createXpk(state.parameters, state.publicState);
  }

  public createPrivate(
    state: TypedPluginState<IHydraParameters, IHydraPublicState>,
    seed: Seed,
  ): Bip44Account {
    return this.createAccount(state.parameters, seed);
  }

  public createAccount(parameters: IHydraParameters, seed: Seed): Bip44Account {
    return Bip44.network(seed, parameters.network).account(parameters.account);
  }

  private createXpk(parameters: IHydraParameters, state: IHydraPublicState): Bip44PublicAccount {
    const acc = parameters.account;
    const { xpub } = state;
    const net = parameters.network;
    return Bip44PublicAccount.fromXpub(acc, xpub, net);
  }
}

export const hydraDefaultRewind = (
  vault: IPluginHolder,
  unlockPassword: string,
  parameters: IHydraParameters,
): void => {
  const seed = vault.unlock(unlockPassword);
  const account = HydraPluginFactory.instance.createAccount(parameters, seed);
  const pk = account.neuter();
  const state: IHydraPublicState = { xpub: pk.xpub };
  vault.createPluginState(HydraPluginFactory.instance.name, parameters, state);
};

export const hydra = async(
  vault: IPluginHolder,
  parameters: IHydraParameters,
): Promise<IPlugin<Bip44PublicAccount, Bip44Account>> => {
  // if (...parameters.network) {
  //   throw new Error(`Network ${parameters.network} is not known`);
  // }
  if (!Number.isSafeInteger(parameters.account) && parameters.account >= 0) {
    throw new Error('Account index must be a non-negative integer');
  }

  const instances = vault.pluginsByName(HydraPluginFactory.instance.name);
  const instance = instances.find((p) => {
    const h = p.parameters as IHydraParameters;
    return h.network === parameters.network &&
      h.account === parameters.account;
  });

  if (!instance) {
    throw new Error(`Could not find account ${parameters.account} of ${parameters.network}`);
  }
  return vault.createTypedPlugin(HydraPluginFactory.instance, instance);
};
