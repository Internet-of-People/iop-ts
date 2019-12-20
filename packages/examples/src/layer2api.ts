import axios, { AxiosInstance } from 'axios';
import { Network, schemaAndHost } from './network';
import { MorpheusTransaction, Interfaces } from '@internet-of-people/did-manager';

const { Operations: { DidDocument: { DidDocument } } } = MorpheusTransaction;

export class Layer2Api {
  private static instance: Layer2Api;
  private readonly api: AxiosInstance;

  private constructor(network: Network) {
    const baseURL = `${schemaAndHost(network) }:4705`;
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

  public async getDidDocument(did: Interfaces.Did, height?: number): Promise<Interfaces.IDidDocument> {
    console.log('Getting Did document...');
    let url = `/did/${did}/document`;

    if (height) {
      url = `${url }/${height}`;
    }
    const resp = await this.api.get(url);
    const documentData: Interfaces.IDidDocumentData = resp.data;
    const result = new DidDocument(documentData);
    return result;
  }
}
