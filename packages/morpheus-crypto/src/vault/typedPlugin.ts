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
    const typedState = new TypedPluginState(this.param, this.state, () => {
      return this.vault.setDirty();
    });
    return this.factory.createPublic(typedState);
  }

  public async priv(unlockPassword: string): Promise<TPrivate> {
    const seed = this.vault.unlock(unlockPassword);
    const typedState = new TypedPluginState(this.param, this.state, () => {
      return this.vault.setDirty();
    });
    return this.factory.createPrivate(typedState, seed);
  }
}
