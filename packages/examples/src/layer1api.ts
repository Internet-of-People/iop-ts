import { Interfaces, Utils } from '@arkecosystem/crypto';
import axios, { AxiosInstance } from 'axios';
import { schemaAndHost, Network } from './network';

export class Layer1Api {
  private static instance: Layer1Api;
  private readonly api: AxiosInstance;

  private constructor(network: Network) {
    const baseURL = `${schemaAndHost(network) }:4703/api/v2`;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static create(network: Network): void {
    Layer1Api.instance = new Layer1Api(network);
  }

  public static get(): Layer1Api {
    return Layer1Api.instance;
  }

  public async sendTx(tx: Interfaces.ITransactionJson): Promise<string> {
    console.log('Sending tx...');
    const resp = await this.api.post('/transactions', JSON.stringify({ transactions: [tx] }));
    const id = resp.data.data.accept;
    console.log(`Tx send, id: ${id}`);
    return id;
  }

  public async getWalletNonce(address: string): Promise<Utils.BigNumber> {
    console.log(`Getting wallet nonce of ${address}...`);

    try {
      const resp = await this.api.get(`/wallets/${address}`);
      const nonce = Utils.BigNumber.make(resp.data.data.nonce);
      console.log(`Nonce of ${address} is ${nonce.toFixed()}`);
      return nonce;
    } catch (e) {
      console.log(`Could not get wallet for ${address}, probably a cold wallet.`);
      console.log(`Nonce of ${address} is 0`);
      return Utils.BigNumber.ZERO;
    }
  }

  public async getWalletBalance(address: string): Promise<Utils.BigNumber> {
    console.log(`Getting wallet balance of ${address}...`);

    try {
      const resp = await this.api.get(`/wallets/${address}`);
      const balance = Utils.BigNumber.make(resp.data.data.balance);
      console.log(`Balance of ${address} is ${balance.toFixed()}`);
      return balance;
    } catch (e) {
      console.log(`Could not get wallet for ${address}, probably a cold wallet.`);
      console.log(`Balance of ${address} is 0`);
      return Utils.BigNumber.ZERO;
    }
  }

  public async getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig> {
    console.log('Getting node crypto config...');
    const resp = await this.api.get('/node/configuration/crypto');
    return resp.data.data;
  }

  public async getCurrentHeight(): Promise<number> {
    console.log('Getting current height...');
    const resp = await this.api.get('/blockchain');
    const { height } = resp.data.data.block;
    console.log(`Height is ${height}`);
    return height;
  }
}
