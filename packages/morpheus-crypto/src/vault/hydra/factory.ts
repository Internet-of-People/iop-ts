import {
  Bip44,
  Bip44Account,
  Seed,
  Bip44PublicAccount,
  validateNetworkName,
} from '@internet-of-people/morpheus-crypto-wasm';

import { IPluginFactory, ITypedPluginFactory, TypedPluginState } from '../plugin';
import { IHydraParameters, IHydraPublicState } from './types';

export class HydraPluginFactory implements
  IPluginFactory,
  ITypedPluginFactory<IHydraParameters, IHydraPublicState, Bip44PublicAccount, Bip44Account> {
  public static instance = new HydraPluginFactory();

  public readonly name = 'Hydra';

  public validate(parameters: unknown, state: unknown): void {
    const p = parameters as IHydraParameters;

    const { network } = p;

    if (typeof network !== 'string') {
      throw new Error(`Network name must be a string.`);
    }

    if (!validateNetworkName(network)) {
      throw new Error(`Account for unknown network ${network} found in wallet.`);
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
