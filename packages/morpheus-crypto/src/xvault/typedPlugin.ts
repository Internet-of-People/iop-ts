import {
  IPlugin,
  IPluginRuntime,
  ITypedPluginFactory,
  TypedPluginState,
} from './plugin';

export class TypedPlugin<TParam, TState, TPublic, TPrivate> implements IPlugin<TPublic, TPrivate> {
  public constructor(
    private readonly factory: ITypedPluginFactory<TParam, TState, TPublic, TPrivate>,
    private readonly param: TParam,
    private readonly vault: IPluginRuntime,
    private readonly state: TState,
  ) { }

  public get pub(): TPublic {
    const typedState = new TypedPluginState(this.param, this.state, async() => {
      await this.vault.save();
    });
    return this.factory.createPublic(typedState);
  }

  public async priv(): Promise<TPrivate> {
    const seed = await this.vault.unlock();
    const typedState = new TypedPluginState(this.param, this.state, async() => {
      await this.vault.save();
    });
    return this.factory.createPrivate(typedState, seed);
  }
}
