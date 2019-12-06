import { Interfaces, Utils } from '@arkecosystem/crypto';
import axios, { AxiosInstance } from 'axios';

export class Api {

  public static create(network: string): void {
    Api.instance = new Api(network);
  }

  public static get(): Api {
    return Api.instance;
  }
  private static instance: Api;
  private readonly api: AxiosInstance;

  private constructor(network: string) {
    let baseURL: string;
    switch (network) {
      case 'testnet':
        baseURL='http://127.0.0.1:4703/api/v2';
        break;
      case 'devnet':
        baseURL='http://35.240.62.119:4703/api/v2';
        break;
      case 'mainnet':
        baseURL='http://35.195.150.223:4703/api/v2';
        break;
      default:
        throw new Error(`Unknown network ${network}`);
    }

    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async sendTx(tx: Interfaces.ITransactionJson): Promise<string> {
    console.log('Sending tx...');
    const resp = await this.api.post('/transactions', JSON.stringify({ transactions:[tx] }));
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
}
