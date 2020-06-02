import { Interfaces } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { IOperationData } from './operation-data';
import { Sdk } from '../index';

export interface IClient {
  sendTx(tx: Interfaces.ITransactionJson): Promise<string>;

  getTxnStatus(txId: Sdk.TransactionId): Promise<Optional<Interfaces.ITransactionJson>>;

  getWallet(address: string): Promise<Optional<IWalletResponse>>;

  getWalletNonce(address: string): Promise<BigInt>;

  getWalletBalance(address: string): Promise<BigInt>;

  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;

  getCurrentHeight(): Promise<number>;
}

export interface IApi {
  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;

  getCurrentHeight(): Promise<number>;

  sendTransferTxWithWIF(
    fromWIF: string,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  ): Promise<string>;

  sendTransferTxWithPassphrase(
    fromPassphrase: string,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  ): Promise<string>;

  sendMorpheusTxWithWIF(
    attempts: IOperationData[],
    passphrase: string,
    nonce?: BigInt,
  ): Promise<string>;

  sendMorpheusTxWithPassphrase(
    attempts: IOperationData[],
    passphrase: string,
    nonce?: BigInt,
  ): Promise<string>;

  getTxnStatus(
    txId: Sdk.TransactionId,
  ): Promise<Optional<Interfaces.ITransactionJson>>;

  getWallet(
    address: string,
  ): Promise<Optional<IWalletResponse>>;

  getWalletNonce(
    address: string,
  ): Promise<BigInt>;

  getWalletBalance(
    address: string,
  ): Promise<BigInt>;
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
