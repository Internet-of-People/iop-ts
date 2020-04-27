import { Interfaces, Utils } from '@arkecosystem/crypto';
import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';
import { schemaAndHost, Network } from '../../network';
import { Layer1 } from '../../types';
import { apiGet, apiPost, HttpError } from '../../internal/http';

export class AxiosClient implements Layer1.IClient {
  private readonly api: AxiosInstance;

  public constructor(network: Network) {
    const baseURL = `${schemaAndHost(network) }:4703/api/v2`;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async sendTx(tx: Interfaces.ITransactionJson): Promise<string> {
    console.log('Sending tx...');
    const resp = await apiPost(this.api, '/transactions', JSON.stringify({ transactions: [tx] }));

    if (resp.data.data.invalid && resp.data.data.invalid.length > 0) {
      /* eslint no-undefined: 0 */
      throw new Error(`Transaction failed: ${JSON.stringify(resp.data.errors, undefined, 2)}`);
    }

    const { accept } = resp.data.data;

    if (accept.length !== 1) {
      /* eslint no-undefined: 0 */
      throw new Error(
        `sendTx expected 1 accepted tx, got ${accept.length}. Response: ${JSON.stringify(resp.data, undefined, 2)}`,
      );
    }

    console.log('Tx sent, id:', accept[0]);
    return accept[0];
  }

  public async getWallet(address: string): Promise<Optional<Layer1.IWalletResponse>> {
    console.log(`Getting wallet of ${address}...`);

    try {
      const resp = await apiGet(this.api, `/wallets/${address}`);
      return Optional.of(resp.data.data);
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        console.log(`Could not get wallet for ${address}, probably a cold wallet.`);
        console.log(`Balance of ${address} is 0`);
        return Optional.empty();
      }
      throw e;
    }
  }

  public async getWalletNonce(address: string): Promise<Utils.BigNumber> {
    console.log(`Getting wallet nonce of ${address}...`);

    const wallet = await this.getWallet(address);

    if (wallet.isPresent()) {
      const nonce = Utils.BigNumber.make(wallet.get().nonce);
      console.log(`Nonce of ${address} is ${nonce.toFixed()}`);
    }

    console.log(`Nonce of ${address} is 0`);
    return Utils.BigNumber.ZERO;
  }

  public async getWalletBalance(address: string): Promise<Utils.BigNumber> {
    console.log(`Getting wallet balance of ${address}...`);

    const wallet = await this.getWallet(address);

    if (wallet.isPresent()) {
      const balance = Utils.BigNumber.make(wallet.get().balance);
      console.log(`Balance of ${address} is ${balance.toFixed()}`);
      return balance;
    }

    console.log(`Balance of ${address} is 0`);
    return Utils.BigNumber.ZERO;
  }

  public async getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig> {
    console.log('Getting node crypto config...');
    const resp = await apiGet(this.api, '/node/configuration/crypto');
    return resp.data.data;
  }

  public async getCurrentHeight(): Promise<number> {
    console.log('Getting current height...');
    const resp = await apiGet(this.api, '/blockchain');
    const { height } = resp.data.data.block;
    console.log(`Height is ${height}`);
    return height;
  }
}
