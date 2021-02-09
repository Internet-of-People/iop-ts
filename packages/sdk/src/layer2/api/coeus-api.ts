import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';
import * as Crypto from '@internet-of-people/morpheus-crypto';
import * as Types from '../../types';
import { apiGet, HttpError/* , apiPost*/ } from '../../internal/http';
import { NetworkConfig } from '../../network';
import * as Coeus from '../../coeus-wasm';

const { log } = Crypto;

export class CoeusApi implements Types.Layer2.ICoeusApi {
  private readonly clientInstance: AxiosInstance;

  public constructor(public readonly networkConfig: NetworkConfig) {
    const baseURL = `${networkConfig.host}:${networkConfig.port}/coeus/v1`;
    this.clientInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async resolve(name: Coeus.DomainName): Promise<unknown> {
    const domain = name.toString();
    log(`Resolving ${domain}...`);

    const resp = await apiGet(this.clientInstance, `/resolve/${domain}`);
    return resp.data.data;
  }

  public async getMetadata(name: Coeus.DomainName): Promise<Types.Layer2.IDomainMetadata> {
    const domain = name.toString();
    log(`Getting metadata of ${domain}...`);

    const resp = await apiGet(this.clientInstance, `/metadata/${domain}`);
    return resp.data as Types.Layer2.IDomainMetadata;
  }

  public async getChildren(name: Coeus.DomainName): Promise<string[]> {
    const domain = name.toString();
    log(`Getting children of ${name}...`);

    const resp = await apiGet(this.clientInstance, `/children/${domain}`);
    return resp.data.children;
  }

  public async getLastNonce(pk: Coeus.PublicKey): Promise<BigInt> {
    log(`Getting last nonce for ${pk}...`);

    const resp = await apiGet(this.clientInstance, `/last-nonce/${pk}`);
    return BigInt(resp.data.nonce);
  }

  public async getTxnStatus(txid: string): Promise<Optional<boolean>> {
    log(`Getting txn status for ${txid}...`);

    try {
      const resp = await apiGet(this.clientInstance, `/txn-status/${txid}`);
      return Optional.of(resp.data);
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return Optional.empty();
      }
      throw e;
    }
  }
}

export const createCoeusApi = (networkConfig: NetworkConfig): Types.Layer2.ICoeusApi => {
  return new CoeusApi(networkConfig);
};
