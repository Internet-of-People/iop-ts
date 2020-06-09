import { Morpheus } from '@internet-of-people/morpheus-crypto-wasm';

import { IPlugin, IPluginHolder } from '../plugin';
import { IMorpheusParameters, IMorpheusPublicState } from './types';
import { MorpheusPublic } from './pub';
import { MorpheusPrivate } from './priv';
import { MorpheusPluginFactory } from './factory';

export const MorpheusPlugin = {
  rewind: (
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
  },

  get: (
    vault: IPluginHolder,
  ): IPlugin<MorpheusPublic, MorpheusPrivate> => {
    const instances = vault.pluginsByName(MorpheusPluginFactory.instance.name);
    const [instance] = instances;

    if (!instance) {
      throw new Error(`Could not find Morpheus`);
    }
    return vault.createTypedPlugin(MorpheusPluginFactory.instance, instance);
  },
};
