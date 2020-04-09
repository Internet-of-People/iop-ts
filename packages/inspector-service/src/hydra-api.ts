import axios, { AxiosInstance } from 'axios';

import { Ark, Crypto, Layer2, Types } from '@internet-of-people/sdk';

export interface IHydraApi {
  getNodeCryptoConfig(): Promise<Ark.Interfaces.INetworkConfig>;
  getBlockIdAtHeight(height?: number): Promise<Types.Sdk.IAfterProof | null>;
  getBeforeProofHistory(contentId: Types.Sdk.ContentId): Promise<Types.Layer2.IBeforeProofHistory>;
  beforeProofExists(contentId: Types.Sdk.ContentId): Promise<boolean>;
  getDidDocument(did: Crypto.Did): Promise<Types.Layer2.IDidDocument>;
}

export class HydraApi implements IHydraApi {
  private readonly api: AxiosInstance;

  public constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async getNodeCryptoConfig(): Promise<Ark.Interfaces.INetworkConfig> {
    console.log('Getting node crypto config...');
    const resp = await this.api.get('/api/v2/node/configuration/crypto');
    return resp.data.data;
  }

  public async getBlockIdAtHeight(height?: number): Promise<Types.Sdk.IAfterProof | null> {
    console.log(`Getting after-proof at ${height || 'now'}...`);
    let url = '/api/v2/blocks?limit=1&transform=false';

    if (height) {
      url = `${url }&height=${ height}`;
    }
    const resp = await this.api.get(url);
    const [block] = resp.data.data;

    if (!block) {
      console.log(`No block with height ${height}`);
      return null;
    }
    const { height: blockHeight, id: blockHash } = block;

    if (!blockHash) {
      console.log(`Block at height ${height} has no ID`);
      return null;
    }
    console.log(`Block ID is ${blockHash}`);
    return { blockHeight, blockHash };
  }

  public async getBeforeProofHistory(contentId: Types.Sdk.ContentId): Promise<Types.Layer2.IBeforeProofHistory> {
    console.log(`Getting history of content ${contentId}...`);
    const url = `/morpheus/v1/before-proof/${contentId}/history`;
    const resp = await this.api.get(url);
    const history: Types.Layer2.IBeforeProofHistory = resp.data;
    return history;
  }

  public async beforeProofExists(contentId: string): Promise<boolean> {
    console.log(`Getting if content ${contentId} exists...`);
    const url = `/morpheus/v1/before-proof/${contentId}/exists`;
    const resp = await this.api.get(url);
    const exists: boolean = resp.data;
    return exists;
  }

  public async getDidDocument(did: Crypto.Did): Promise<Types.Layer2.IDidDocument> {
    console.log(`Getting Did document ${did}...`);
    const url = `/morpheus/v1/did/${did}/document`;
    const resp = await this.api.get(url);
    const documentData: Types.Layer2.IDidDocumentData = resp.data;
    const result = new Layer2.DidDocument(documentData);
    return result;
  }
}
