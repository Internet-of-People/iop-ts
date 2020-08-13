import { Interfaces } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { IOperationData } from './operation-data';
import { Sdk } from '../index';

export interface ITimestamp {
  epoch: number;
  unix: number;
  human: string;
}

export interface ITransactionStatus {
  id?: string;
  blockId?: string;
  version?: number;
  type: number;
  typeGroup?: number;
  amount: string;
  fee: string;
  sender: string;
  senderPublicKey: string;
  recipient: string;
  signature?: string;
  signSignature?: string;
  signatures?: string[];
  vendorField?: string;
  asset?: Interfaces.ITransactionAsset;
  confirmations: number;
  timestamp?: ITimestamp;
  nonce?: string;
}

export interface IClient {
  sendTx(tx: Interfaces.ITransactionJson): Promise<string>;

  getTxnStatus(txId: Sdk.TransactionId): Promise<Optional<ITransactionStatus>>;

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
  ): Promise<Optional<ITransactionStatus>>;

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
