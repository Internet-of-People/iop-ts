import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';

import { MorpheusTransaction, Interfaces } from '@internet-of-people/did-manager';
import { IO } from '@internet-of-people/sdk';
type TransactionId = IO.TransactionId;
type Did = IO.Did;

import { Network, schemaAndHost } from './network';

const { Operations: { DidDocument: { DidDocument } } } = MorpheusTransaction;

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

  public async getBeforeProofHistory(contentId: string): Promise<Interfaces.IBeforeProofHistory> {
    console.log(`Getting history of ${contentId}...`);
    const url = `/before-proof/${contentId}/history`;
    const resp = await this.api.get(url);
    const history: Interfaces.IBeforeProofHistory = resp.data;
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

  public async getDidDocument(did: Did, height?: number): Promise<Interfaces.IDidDocument> {
    console.log(`Getting Did document ${did} at ${height || 'now'}...`);
    let url = `/did/${did}/document`;

    if (height) {
      url = `${url}/${height}`;
    }
    const resp = await this.api.get(url);
    const documentData: Interfaces.IDidDocumentData = resp.data;
    const result = new DidDocument(documentData);
    return result;
  }

  public async getTxnStatus(txid: string): Promise<Optional<boolean>> {
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

  public async getLastTxId(did: string): Promise<TransactionId | null> {
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
