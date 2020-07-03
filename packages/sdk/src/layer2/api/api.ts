import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';
import * as Crypto from '@internet-of-people/morpheus-crypto';
import * as Layer2 from '../../layer2';
import * as Types from '../../types';
import { apiGet, HttpError, apiPost } from '../../internal/http';
import { Network, schemaAndHost } from '../../network';

export class Api {
  private readonly api: AxiosInstance;

  public constructor(network: Network) {
    const baseURL = `${schemaAndHost(network) }:4705/morpheus/v1`;
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
    const resp = await apiGet(this.api, this.withUntilHeight(
      `/did/${did}/document`,
      height,
    ));
    const documentData: Types.Layer2.IDidDocumentData = resp.data;
    const result = new Layer2.DidDocument(documentData);
    return result;
  }

  // NOTE that layer2 status is returned here, i.e. Morpheus/DAC transactions are expected.
  //      Layer1 (e.g. transfer) transactions are not found thus Optional.empty() is returned for them.
  public async getTxnStatus(morpheusTxId: Types.Sdk.TransactionId): Promise<Optional<boolean>> {
    console.log(`Getting txn layer2 status for ${morpheusTxId}...`);

    try {
      const resp = await apiGet(this.api, `/txn-status/${morpheusTxId}`);
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

  public async getDidTransactionIds(
    did: Crypto.Did,
    fromHeight: number,
    untilHeight?: number,
  ): Promise<Types.Layer2.ITransactionIdHeight[]> {
    console.log(`Getting transaction ids for ${did}...`);
    return this.didTransactionIdsQuery(false, did, fromHeight, untilHeight);
  }

  public async getDidTransactionAttemptIds(
    did: Crypto.Did,
    fromHeight: number,
    untilHeight?: number,
  ): Promise<Types.Layer2.ITransactionIdHeight[]> {
    console.log(`Getting transaction attempt ids for ${did}...`);
    return this.didTransactionIdsQuery(true, did, fromHeight, untilHeight);
  }

  public async getDidOperations(
    did: Crypto.Did,
    fromHeight: number,
    untilHeight?: number,
  ): Promise<Types.Layer2.IDidOperation[]> {
    console.log(`Getting did operations for ${did}...`);
    return this.didOperationQuery(false, did, fromHeight, untilHeight);
  }

  public async getDidOperationAttempts(
    did: Crypto.Did,
    fromHeight: number,
    untilHeight?: number,
  ): Promise<Types.Layer2.IDidOperation[]> {
    console.log(`Getting did operations for ${did}...`);
    return this.didOperationQuery(true, did, fromHeight, untilHeight);
  }

  public async checkTransactionValidity(
    operationAttempts: Types.Layer1.IOperationData[],
  ): Promise<Types.Layer2.IDryRunOperationError[]> {
    console.log('Checking operation attempts\' validity...');
    const resp = await apiPost(
      this.api,
      '/check-transaction-validity',
      JSON.stringify(operationAttempts),
    );
    return resp.data;
  }

  private async didTransactionIdsQuery(
    includeAttempts: boolean,
    did: Crypto.Did,
    fromHeight: number,
    untilHeight?: number,
  ): Promise<Types.Layer2.ITransactionIdHeight[]> {
    try {
      const path = includeAttempts ? 'transaction-attempts' : 'transactions';
      const resp = await apiGet(
        this.api,
        this.withUntilHeight(`/did/${did}/${path}/${fromHeight}`, untilHeight),
      );
      return resp.data;
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return [];
      }
      throw e;
    }
  }

  private async didOperationQuery(
    includeAttempts: boolean,
    did: Crypto.Did,
    fromHeight: number,
    untilHeight?: number,
  ): Promise<Types.Layer2.IDidOperation[]> {
    try {
      const path = includeAttempts ? 'operation-attempts' : 'operations';
      const resp = await apiGet(
        this.api,
        this.withUntilHeight(`/did/${did}/${path}/${fromHeight}`, untilHeight),
      );
      return resp.data;
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return [];
      }
      throw e;
    }
  }

  private withUntilHeight(url: string, height?: number): string {
    return height ? `${url}/${height}` : url;
  }
}

export const createApi = (network: Network): Types.Layer2.IApi => {
  return new Api(network);
};
