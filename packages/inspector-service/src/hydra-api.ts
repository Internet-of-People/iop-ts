import axios, { AxiosInstance } from 'axios';
import { Interfaces as CryptoIf } from '@arkecosystem/crypto';

import { MorpheusTransaction, Interfaces as DidIf } from '@internet-of-people/did-manager';
const { Operations: { DidDocument: { DidDocument } } } = MorpheusTransaction;
import { IO } from '@internet-of-people/sdk';
type Did = IO.Did;
type IAfterProof = IO.IAfterProof;

export interface IHydraApi {
  getNodeCryptoConfig(): Promise<CryptoIf.INetworkConfig>;
  getBlockIdAtHeight(height?: number): Promise<IAfterProof | null>;
  beforeProofExists(contentId: string): Promise<boolean>;
  getDidDocument(did: Did): Promise<DidIf.IDidDocument>;
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

  public async getNodeCryptoConfig(): Promise<CryptoIf.INetworkConfig> {
    console.log('Getting node crypto config...');
    const resp = await this.api.get('/api/v2/node/configuration/crypto');
    return resp.data.data;
  }

  public async getBlockIdAtHeight(height?: number): Promise<IAfterProof | null> {
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

  public async beforeProofExists(contentId: string): Promise<boolean> {
    console.log(`Getting if content ${contentId} exists...`);
    const url = `/before-proof/${contentId}/exists`;
    const resp = await this.api.get(url);
    const exists: boolean = resp.data;
    return exists;
  }

  public async getDidDocument(did: Did): Promise<DidIf.IDidDocument> {
    console.log(`Getting Did document ${did}...`);
    const url = `/did/${did}/document`;
    const resp = await this.api.get(url);
    const documentData: DidIf.IDidDocumentData = resp.data;
    const result = new DidDocument(documentData);
    return result;
  }
}
