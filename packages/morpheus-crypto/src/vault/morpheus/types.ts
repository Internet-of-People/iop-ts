import { PublicKeyData } from '../../types';

// This is just for symmetry with plugins having parameters
export type IMorpheusParameters = void;

export interface IMorpheusPublicState {
  personas: PublicKeyData[];
}
