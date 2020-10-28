import axios, { AxiosInstance } from 'axios';
// import Optional from 'optional-js';
import * as Crypto from '@internet-of-people/morpheus-crypto';
import * as Layer2 from '../../layer2';
import * as Types from '../../types';
import { apiGet/* , HttpError, apiPost*/ } from '../../internal/http';
import { NetworkConfig } from '../../network';
import * as Coeus from '../../coeus-wasm';

const { log } = Crypto;

export class CoeusApi implements Types.Layer2.ICoeusApi {
  private readonly api: AxiosInstance;

  public constructor(networkConfig: NetworkConfig) {
    const baseURL = `${networkConfig.host}:${networkConfig.port}/coeus/v1`;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async resolve(name: Coeus.DomainName): Promise<unknown> {
    log(`Resolving ${name}...`);

    const resp = await apiGet(this.api, `/resolve/${name}`);
    return resp.data.data;
  }

  public async getMetadata(name: Coeus.DomainName): Promise<Types.Layer2.IDomainMetadata> {
    log(`Getting metadata of ${name}...`);

    const resp = await apiGet(this.api, `/metadata/${name}`);
    return resp.data.metadata as Types.Layer2.IDomainMetadata;
  }

  public async getChildren(name: Coeus.DomainName): Promise<string[]> {
    log(`Getting children of ${name}...`);

    const resp = await apiGet(this.api, `/children/${name}`);
    return resp.data.children;
  }

  public async getLastNonce(pk: Coeus.PublicKey): Promise<BigInt> {
    log(`Getting last nonce for ${pk}...`);

    const resp = await apiGet(this.api, `/last-nonce/${pk}`);
    return resp.data.nonce;
  }
}

export const createCoeusApi = (networkConfig: NetworkConfig): Types.Layer2.ICoeusApi => {
  return new CoeusApi(networkConfig);
};
