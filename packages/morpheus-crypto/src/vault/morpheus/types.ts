import { Seed } from '@internet-of-people/morpheus-crypto-wasm';
import { PublicKeyData } from '../../types';

export interface IMorpheusPublicState {
  personas: PublicKeyData[];
}

export interface IMorpheusContext {
  rewind?: (parameters: void, seed: Seed) => Promise<IMorpheusPublicState>;
}
