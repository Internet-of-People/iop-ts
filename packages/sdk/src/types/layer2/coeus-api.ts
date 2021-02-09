import * as Coeus from '../../coeus-wasm';
import Optional from 'optional-js';

export interface IDomainMetadata {
  owner: string;
  subtreePolicies: {
    expiration?: number;
    schema?: unknown;
  };
  registrationPolicy: 'owner' | 'any';
  expiresAtHeight: number;
}

export interface ICoeusApi {
  resolve(name: Coeus.DomainName): Promise<unknown>;
  getMetadata(name: Coeus.DomainName): Promise<IDomainMetadata>;
  getChildren(name: Coeus.DomainName): Promise<string[]>;
  getLastNonce(pk: Coeus.PublicKey): Promise<BigInt>;
  getTxnStatus(txid: string): Promise<Optional<boolean>>;
}
