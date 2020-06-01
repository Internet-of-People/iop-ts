import { Seed } from '@internet-of-people/morpheus-crypto-wasm';

/* eslint @typescript-eslint/no-empty-interface: 0 */
export interface IMorpheusPublicState { }

export interface IMorpheusContext {
  rewind(parameters: void, seed: Seed): Promise<IMorpheusPublicState>;
}
