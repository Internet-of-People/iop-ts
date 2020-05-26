import { Seed } from '@internet-of-people/morpheus-crypto-wasm';

export interface IHydraContext {
  rewind?: (parameters: IHydraParameters, seed: Seed) => Promise<IHydraPublicState>;
}

export interface IHydraParameters {
  readonly network: string;
  readonly account: number;
}

export interface IHydraPublicState {
  xpub: string;
  count: number;
}
