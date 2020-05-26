import { Bip44PublicAccount, Bip44PublicKey } from '@internet-of-people/morpheus-crypto-wasm';

import { TypedPluginState } from '../plugin';
import { IHydraParameters, IHydraPublicState } from './types';

// TODO consider if keys should be better protected from external modifications
export class HydraAccountPublic {
  private readonly xpk: Bip44PublicAccount;

  public constructor(private readonly state: TypedPluginState<IHydraParameters, IHydraPublicState>) {
    const acc = this.state.parameters.account;
    const { xpub } = this.state.publicState;
    const net = this.state.parameters.network;
    this.xpk = Bip44PublicAccount.fromXpub(acc, xpub, net);
  }

  public get keys(): Bip44PublicKey[] {
    const { count } = this.state.publicState;
    const keys = [];

    for (let i = 0; i < count; ++i) {
      const pk = this.xpk.key(i);
      keys.push(pk);
    }
    return keys;
  }

  public async createKey(): Promise<Bip44PublicKey> {
    const nextIdx = this.state.publicState.count;
    const nextKey = this.xpk.key(nextIdx);
    this.state.publicState.count = nextIdx + 1;
    await this.state.save();
    return nextKey;
  }
}
