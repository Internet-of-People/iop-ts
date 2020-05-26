import { Bip44Account, Bip44Key } from '@internet-of-people/morpheus-crypto-wasm';

import { TypedPluginState } from '../plugin';
import { IHydraParameters, IHydraPublicState } from './types';

export class HydraAccountPrivate {
  public constructor(
    private readonly xsk: Bip44Account,
    private readonly state: TypedPluginState<IHydraParameters, IHydraPublicState>,
  ) {
  }

  public async createKey(): Promise<Bip44Key> {
    const nextIdx = this.state.publicState.count;
    const nextKey = this.xsk.key(nextIdx);
    this.state.publicState.count = nextIdx + 1;
    await this.state.save();
    return nextKey;
  }
}
