import { Interfaces } from '@arkecosystem/crypto';
import axios, { AxiosInstance } from 'axios';
import Optional from 'optional-js';
import { log } from '@internet-of-people/morpheus-crypto';
import { NetworkConfig } from '../../network';
import { Layer1, Sdk } from '../../types';
import { apiGet, apiPost, HttpError } from '../../internal/http';


export class AxiosClient implements Layer1.IClient {
  private readonly clientInstance: AxiosInstance;

  public constructor(public readonly networkConfig: NetworkConfig) {
    const baseURL = `${networkConfig.host}:${networkConfig.port}/api/v2`;
    this.clientInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async sendTx(tx: Interfaces.ITransactionJson): Promise<string> {
    log('Sending tx...');
    const resp = await apiPost(this.clientInstance, '/transactions', JSON.stringify({ transactions: [tx] }));

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

    log('Tx sent, id:', accept[0]);
    return accept[0];
  }

  public async sendMultipleTx(transactions: Interfaces.ITransactionJson[]): Promise<Layer1.ITransactionResult> {
    log('Sending txns...');
    const resp = await apiPost(this.clientInstance, '/transactions', JSON.stringify({ transactions }));

    if (resp.data.data.invalid && resp.data.data.invalid.length > 0) {
      /* eslint no-undefined: 0 */
      throw new Error(`Transaction failed: ${JSON.stringify(resp.data.errors, undefined, 2)}`);
    }

    const { accept, invalid } = resp.data.data;

    log('Tx sent, id:', accept[0]);
    const result: Layer1.ITransactionResult = {
      accept,
      invalid,
    };

    if (invalid.length > 0) {
      result.errorResponse = JSON.stringify(resp.data, undefined, 2);
    }

    return result;
  }

  public async getTxnStatus(txId: Sdk.TransactionId): Promise<Optional<Layer1.ITransactionStatus>> {
    log(`Getting txn layer1 status for ${txId}...`);

    try {
      const resp = await apiGet(this.clientInstance, `/transactions/${txId}`);
      return Optional.of(resp.data.data);
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        return Optional.empty();
      }
      throw e;
    }
  }

  public async getWallet(address: string): Promise<Optional<Layer1.IWalletResponse>> {
    log(`Getting wallet of ${address}...`);

    try {
      const resp = await apiGet(this.clientInstance, `/wallets/${address}`);
      return Optional.of(resp.data.data);
    } catch (e) {
      if (e instanceof HttpError && e.statusCode === 404) {
        log(`Could not get wallet for ${address}, probably a cold wallet.`);
        log(`Balance of ${address} is 0`);
        return Optional.empty();
      }
      throw e;
    }
  }

  public async getWalletNonce(address: string): Promise<bigint> {
    log(`Getting wallet nonce of ${address}...`);

    const wallet = await this.getWallet(address);

    if (wallet.isPresent()) {
      const nonce = BigInt(wallet.get().nonce);
      log(`Nonce of ${address} is ${nonce.toLocaleString()}`);
      return nonce;
    }

    log(`Nonce of ${address} is 0`);
    return BigInt(0);
  }

  public async getWalletBalance(address: string): Promise<bigint> {
    log(`Getting wallet balance of ${address}...`);

    const wallet = await this.getWallet(address);

    if (wallet.isPresent()) {
      return BigInt(wallet.get().balance);
    }

    return BigInt(0);
  }

  public async getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig> {
    log('Getting node crypto config...');
    const resp = await apiGet(this.clientInstance, '/node/configuration/crypto');
    return resp.data.data;
  }

  public async getCurrentHeight(): Promise<number> {
    log('Getting current height...');
    const resp = await apiGet(this.clientInstance, '/blockchain');
    const { height } = resp.data.data.block;
    log(`Height is ${height}`);
    return height;
  }
}
