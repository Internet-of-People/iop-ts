import { Seed } from '@internet-of-people/morpheus-crypto-wasm';

export interface IPluginFactory {
  readonly name: string;
  validate(parameters: unknown, state: unknown): void;
}

export interface IPluginState {
  readonly pluginName: string;
  readonly parameters: unknown;
  publicState: unknown;
}

export interface IPluginRuntime {
  save(): Promise<void>;
  unlock(): Promise<Seed>;
}

export interface IPluginHolder extends IPluginRuntime {
  createTypedPlugin<TParam, TState, TPublic, TPrivate>(
    factory: ITypedPluginFactory<TParam, TState, TPublic, TPrivate>,
    instance: IPluginState,
  ): IPlugin<TPublic, TPrivate>;
  createPluginState<TParam, TState>(
    pluginName: string,
    parameters: TParam,
    rewind: (parameters: TParam, seed: Seed) => Promise<TState>,
  ): Promise<IPluginState>;
  pluginsByName(name: string): IPluginState[];
}

export class TypedPluginState<TParam, TState> {
  public constructor(
    public readonly parameters: TParam,
    public readonly publicState: TState,
    public readonly save: () => Promise<void>,
  ) {}
}

export interface ITypedPluginFactory<TParam, TState, TPublic, TPrivate> {
  createPublic(state: TypedPluginState<TParam, TState>): TPublic;
  createPrivate(state: TypedPluginState<TParam, TState>, seed: Seed): TPrivate;
}

export interface IPlugin<TPublic, TPrivate> {
  readonly pub: TPublic;
  priv(): Promise<TPrivate>;
}
