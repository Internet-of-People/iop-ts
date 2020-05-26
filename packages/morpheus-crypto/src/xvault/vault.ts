import { Bip39, Seed } from '@internet-of-people/morpheus-crypto-wasm';
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
import multibase from 'multibase';

export interface IVaultState {
  readonly encryptedSeed: string;
  readonly plugins: IPluginState[];
}

export interface IVaultContext {
  save?: (state: IVaultState) => Promise<void>;
  // forDecrypt is false when creating the vault for the 1st time, true in all other cases
  askUnlockPassword?: (forDecrypt: boolean) => Promise<string>;
}

const decrypt = (encryptedSeed: string, _unlockPassword: string): Seed => {
  let encryptedData = Uint8Array.from(multibase.decode(encryptedSeed));
  let decryptedData = encryptedData; // TODO encrypt with password
  return new Seed(decryptedData);
}

const encrypt = (seed: Seed, _unlockPassword: string): string => {
  const decryptedData = Buffer.from(seed.toBytes());
  const encryptedData = decryptedData; // TODO encrypt with password
  return multibase.encode('base64url', encryptedData).toString('ascii');
}

const defaultSave = async (_state: IVaultState): Promise<void> => {};
const defaultAskUnlockPassword = async (_forDecrypt: boolean): Promise<string> => '';

export class XVault implements IPluginHolder, IPluginRuntime {
  public static readonly pluginFactories: IPluginFactory[] = [
    HydraPluginFactory.instance,
    MorpheusPluginFactory.instance,
  ];

  private readonly contextSave: (state: IVaultState) => Promise<void>;
  private readonly contextAskUnlockPassword: (forDecrypt: boolean) => Promise<string>;

  private constructor(
    private readonly encryptedSeed: string,
    private readonly plugins: IPluginState[],
    context?: IVaultContext,
  ) {
    this.contextSave = context?.save ?? defaultSave;
    this.contextAskUnlockPassword = context?.askUnlockPassword ?? defaultAskUnlockPassword;

    for (const plugin of plugins) {
      const factory = XVault.pluginFactories.find((f) => {
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
  }

  public static async create(phrase: string, bip39Password: string, context?: IVaultContext): Promise<XVault> {
    const seed = new Bip39('en')
      .phrase(phrase)
      .password(bip39Password);
    const contextAskUnlockPassword = context?.askUnlockPassword ?? defaultAskUnlockPassword;
    const unlockPassword = await contextAskUnlockPassword(false);
    const encryptedSeed = encrypt(seed, unlockPassword);
    return new XVault(encryptedSeed, [], context);
  }

  public static load(data: IVaultState, context?: IVaultContext): XVault {
    return new XVault(data.encryptedSeed, data.plugins, context);
  }

  public async unlock(): Promise<Seed> {
    const unlockPassword = await this.contextAskUnlockPassword(true);
    const seed = decrypt(this.encryptedSeed, unlockPassword);
    return seed;
  }

  public async save(): Promise<void> {
    const state = {
      encryptedSeed: this.encryptedSeed,
      plugins: this.plugins,
    };
    await this.contextSave(state);
  }

  public pluginsByName(pluginName: string): IPluginState[] {
    return this.plugins.filter((p) => {
      return p.pluginName === pluginName;
    });
  }

  public async createPluginState<TPublic, TParams>(
    pluginName: string,
    parameters: TParams,
    rewind: (parameters: TParams, seed: Seed) => Promise<TPublic>,
  ): Promise<IPluginState> {
    const seed = await this.unlock();
    const publicState = await rewind(parameters, seed);
    const instance: IPluginState = {
      pluginName,
      parameters,
      publicState,
    };
    this.plugins.push(instance);
    await this.save();
    return instance;
  }

  public createTypedPlugin<TParam, TState, TPublic, TPrivate>(
    factory: ITypedPluginFactory<TParam, TState, TPublic, TPrivate>,
    instance: IPluginState,
  ): IPlugin<TPublic, TPrivate> {
    return new TypedPlugin(factory, instance.parameters, this, instance.publicState);
  }
}