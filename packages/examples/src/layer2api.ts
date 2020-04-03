import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';
import { Crypto, Layer2, Types } from '@internet-of-people/sdk';
import { Network, schemaAndHost } from './network';

export class Layer2Api {
  private static instance: Layer2Api;
  private readonly api: AxiosInstance;

  private constructor(network: Network) {
    const baseURL = `${schemaAndHost(network) }:4703/morpheus/v1`;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static create(network: Network): void {
    Layer2Api.instance = new Layer2Api(network);
  }

  public static get(): Layer2Api {
    return Layer2Api.instance;
  }

  public async getBeforeProofHistory(contentId: string): Promise<Types.Layer2.IBeforeProofHistory> {
    console.log(`Getting history of ${contentId}...`);
    const url = `/before-proof/${contentId}/history`;
    const resp = await this.api.get(url);
    const history: Types.Layer2.IBeforeProofHistory = resp.data;
    return history;
  }

  public async beforeProofExists(contentId: string, height?: number): Promise<boolean> {
    console.log(`Getting if content ${contentId} exists at ${height || 'now'}...`);
    let url = `/before-proof/${contentId}/exists`;

    if (height) {
      url = `${url}/${height}`;
    }
    const resp = await this.api.get(url);
    const exists: boolean = resp.data;
    return exists;
  }

  public async getDidDocument(did: Crypto.Did, height?: number): Promise<Types.Layer2.IDidDocument> {
    console.log(`Getting Did document ${did} at ${height || 'now'}...`);
    let url = `/did/${did}/document`;

    if (height) {
      url = `${url}/${height}`;
    }
    const resp = await this.api.get(url);
    const documentData: Types.Layer2.IDidDocumentData = resp.data;
    const result = new Layer2.DidDocument(documentData);
    return result;
  }

  public async getTxnStatus(txid: Types.Sdk.TransactionId): Promise<Optional<boolean>> {
    console.log(`Getting txn status for ${txid}...`);

    const resp = await this.api.get(`/txn-status/${txid}`, {
      validateStatus: (status) => {
        return status >= 200 && status < 300 || status === 404;
      },
    });

    if (resp.status === 404) {
      return Optional.empty();
    } else {
      return Optional.of(resp.data);
    }
  }

  public async getLastTxId(did: Crypto.Did): Promise<Types.Sdk.TransactionId | null> {
    console.log(`Getting last txn id for ${did}...`);
    const resp = await this.api.get(`/did/${did}/transactions/last`, {
      validateStatus: (status) => {
        return status >= 200 && status < 300 || status === 404;
      },
    });

    if (resp.status === 404) {
      return null;
    } else {
      return resp.data.transactionId;
    }
  }
}
