import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';
import * as Crypto from '@internet-of-people/morpheus-crypto';
import * as Layer2 from '../../layer2';
import * as Types from '../../types';
import { apiGet, HttpError } from '../../internal/http';
import { Network, schemaAndHost } from '../../network';

export class Api {
  private readonly api: AxiosInstance;

  public constructor(network: Network) {
    const baseURL = `${schemaAndHost(network) }:4703/morpheus/v1`;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async getBeforeProofHistory(contentId: string): Promise<Types.Layer2.IBeforeProofHistory> {
    console.log(`Getting history of ${contentId}...`);
    const url = `/before-proof/${contentId}/history`;
    const resp = await apiGet(this.api, url);
    const history: Types.Layer2.IBeforeProofHistory = resp.data;
    return history;
  }

  public async beforeProofExists(contentId: string, height?: number): Promise<boolean> {
    console.log(`Getting if content ${contentId} exists at ${height || 'now'}...`);
    let url = `/before-proof/${contentId}/exists`;

    if (height) {
      url = `${url}/${height}`;
    }
    const resp = await apiGet(this.api, url);
    const exists: boolean = resp.data;
    return exists;
  }

  public async getDidDocument(did: Crypto.Did, height?: number): Promise<Types.Layer2.IDidDocument> {
    console.log(`Getting Did document ${did} at ${height || 'now'}...`);
    let url = `/did/${did}/document`;

    if (height) {
      url = `${url}/${height}`;
    }
    const resp = await apiGet(this.api, url);
    const documentData: Types.Layer2.IDidDocumentData = resp.data;
    const result = new Layer2.DidDocument(documentData);
    return result;
  }

  // NOTE that layer2 status is returned here, i.e. layer2 transactions are expected.
  //      Layer1 txns are not found thus Optional.empty() is returned for them as well.
  public async getTxnStatus(layer2TxId: Types.Sdk.TransactionId): Promise<Optional<boolean>> {
    console.log(`Getting txn status for ${layer2TxId}...`);

    try {
      const resp = await apiGet(this.api, `/txn-status/${layer2TxId}`);
      return Optional.of(resp.data);
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return Optional.empty();
      }
      throw e;
    }
  }

  public async getLastTxId(did: Crypto.Did): Promise<Types.Sdk.TransactionId | null> {
    console.log(`Getting last txn id for ${did}...`);

    try {
      const resp = await apiGet(this.api, `/did/${did}/transactions/last`);
      return resp.data.transactionId;
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return null;
      }
      throw e;
    }
  }
}

export const createApi = (network: Network): Types.Layer2.IApi => {
  return new Api(network);
};
