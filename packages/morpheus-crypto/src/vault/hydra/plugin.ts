import { Bip44Account, Bip44PublicAccount } from '@internet-of-people/morpheus-crypto-wasm';

import { IPlugin, IPluginHolder } from '../plugin';
import { IHydraParameters, IHydraPublicState } from './types';
import { HydraPluginFactory } from './factory';

export const HydraPlugin = {
  rewind: (
    vault: IPluginHolder,
    unlockPassword: string,
    parameters: IHydraParameters,
  ): void => {
    const seed = vault.unlock(unlockPassword);
    const account = HydraPluginFactory.instance.createAccount(parameters, seed);
    const pk = account.neuter();
    const state: IHydraPublicState = { xpub: pk.xpub };
    vault.createPluginState(HydraPluginFactory.instance.name, parameters, state);
  },

  get: (
    vault: IPluginHolder,
    parameters: IHydraParameters,
  ): IPlugin<Bip44PublicAccount, Bip44Account> => {
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
  },
};
