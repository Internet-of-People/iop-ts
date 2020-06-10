import multibase from 'multibase';
import { Bip39, Seed } from '@internet-of-people/morpheus-crypto-wasm';

import { decrypt, encrypt } from '../encrypt';
import {
  IPlugin,
  IPluginHolder,
  IPluginRuntime,
  IPluginFactory,
  ITypedPluginFactory,
  IPluginState,
} from './plugin';
import { TypedPlugin } from './typedPlugin';
import { HydraPluginFactory } from './hydra';
import { MorpheusPluginFactory } from './morpheus';

export interface IVaultState {
  readonly encryptedSeed: string;
  readonly plugins: IPluginState[];
}

const decryptSeed = (encryptedSeed: string, unlockPassword: string): Seed => {
  const encryptedData = Uint8Array.from(multibase.decode(encryptedSeed));
  const decryptedData = decrypt(encryptedData, unlockPassword);
  return new Seed(decryptedData);
};

const encryptSeed = (seed: Seed, unlockPassword: string): string => {
  const decryptedData = Buffer.from(seed.toBytes());
  const encryptedData = encrypt(decryptedData, unlockPassword);
  return multibase.encode('base64url', Buffer.from(encryptedData)).toString('ascii');
};

export class Vault implements IPluginHolder, IPluginRuntime {
  public static readonly pluginFactories: IPluginFactory[] = [
    HydraPluginFactory.instance,
    MorpheusPluginFactory.instance,
  ];

  private isDirty: boolean;

  private constructor(
    private readonly encryptedSeed: string,
    private readonly plugins: IPluginState[],
  ) {
    for (const plugin of plugins) {
      const factory = Vault.pluginFactories.find((f) => {
        return f.name === plugin.pluginName;
      });

      if (!factory) {
        // This is not necessarily an error. If we have another way to warn the user,
        // we could just keep and ignore the extra data
        throw Error(`No vault plugin registered for ${plugin.pluginName}`);
      }
      // Let the plugin validate the saved data and throw an exception if it cannot handle it.
      factory.validate(plugin.parameters, plugin.publicState);
    }
    this.isDirty = false;
  }

  public static create(phrase: string, bip39Password: string, unlockPassword: string): Vault {
    const seed = new Bip39('en')
      .phrase(phrase)
      .password(bip39Password);
    const encryptedSeed = encryptSeed(seed, unlockPassword);
    return new Vault(encryptedSeed, []);
  }

  public static load(data: IVaultState): Vault {
    return new Vault(data.encryptedSeed, data.plugins);
  }

  public get dirty(): boolean {
    return this.isDirty;
  }

  public setDirty(): void {
    this.isDirty = true;
  }

  public save(): IVaultState {
    const state = {
      encryptedSeed: this.encryptedSeed,
      plugins: [...this.plugins],
    };
    this.isDirty = false;
    return state;
  }

  public unlock(password: string): Seed {
    const seed = decryptSeed(this.encryptedSeed, password);
    return seed;
  }

  public pluginsByName(pluginName: string): IPluginState[] {
    return this.plugins.filter((p) => {
      return p.pluginName === pluginName;
    });
  }

  public createPluginState<TPublic, TParams>(
    pluginName: string,
    parameters: TParams,
    publicState: TPublic,
  ): IPluginState {
    const instance: IPluginState = {
      pluginName,
      parameters,
      publicState,
    };
    this.plugins.push(instance);
    this.isDirty = true;
    return instance;
  }

  public createTypedPlugin<TParam, TState, TPublic, TPrivate>(
    factory: ITypedPluginFactory<TParam, TState, TPublic, TPrivate>,
    instance: IPluginState,
  ): IPlugin<TPublic, TPrivate> {
    return new TypedPlugin(factory, instance.parameters, this, instance.publicState);
  }
}
