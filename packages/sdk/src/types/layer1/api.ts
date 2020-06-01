import { Interfaces, Utils } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { IOperationData } from './operation-data';
import { Sdk } from '../index';

export interface IClient {
  sendTx(tx: Interfaces.ITransactionJson): Promise<string>;

  getTxnStatus(txId: Sdk.TransactionId): Promise<Optional<Interfaces.ITransactionJson>>;

  getWallet(address: string): Promise<Optional<IWalletResponse>>;

  getWalletNonce(address: string): Promise<Utils.BigNumber>;

  getWalletBalance(address: string): Promise<Utils.BigNumber>;

  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;

  getCurrentHeight(): Promise<number>;
}

export interface IApi {
  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;

  getCurrentHeight(): Promise<number>;

  sendTransferTxWithWIF(
    fromWIF: string,
    toAddress: string,
    amountFlake: Utils.BigNumber,
    nonce?: Utils.BigNumber,
  ): Promise<string>;

  sendTransferTx(
    fromPassphrase: string,
    toAddress: string,
    amountFlake: Utils.BigNumber,
    nonce?: Utils.BigNumber,
  ): Promise<string>;

  sendMorpheusTx(
    attempts: IOperationData[],
    passphrase: string,
    nonce?: Utils.BigNumber,
  ): Promise<string>;

  getTxnStatus(
    txId: Sdk.TransactionId,
  ): Promise<Optional<Interfaces.ITransactionJson>>;

  getWallet(
    address: string,
  ): Promise<Optional<IWalletResponse>>;

  getWalletNonce(
    address: string,
  ): Promise<Utils.BigNumber>;

  getWalletBalance(
    address: string,
  ): Promise<Utils.BigNumber>;
}

export interface IWalletResponse {
  address: string;
  publicKey: string;
  nonce: string;
  balance: string;
  attributes: unknown;
  isDelegate: boolean;
  isResigned: boolean;
}
