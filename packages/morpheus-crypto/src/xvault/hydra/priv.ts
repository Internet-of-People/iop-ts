import { Bip44Account, Bip44Key } from '@internet-of-people/morpheus-crypto-wasm';

import { TypedPluginState } from '../plugin';
import { IHydraParameters, IHydraPublicState } from './types';

export class HydraAccountPrivate {
  public constructor(
    private readonly xsk: Bip44Account,
    private readonly state: TypedPluginState<IHydraParameters, IHydraPublicState>,
  ) {
  }

  public getKey(idx: number): Bip44Key {
    const count = this.state.publicState.count;
    if (idx < 0 || idx >= count) {
      throw new Error(`Only indexes 0..${count - 1} were created yet in this account`);
    }
    return this.xsk.key(idx);
  }

  public async setCount(value: number): Promise<void> {
    this.state.publicState.count = value;
    await this.state.save();
  }

  public async createKey(): Promise<Bip44Key> {
    const nextIdx = this.state.publicState.count;
    const nextKey = this.xsk.key(nextIdx);
    this.state.publicState.count = nextIdx + 1;
    await this.state.save();
    return nextKey;
  }
}
