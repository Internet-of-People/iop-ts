import { Interfaces } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { HydraPrivate, SecpPublicKey } from '@internet-of-people/morpheus-crypto';
import { IOperationData } from './operation-data';
import { IMorpheusAsset } from './asset';
import { Sdk } from '../index';
import { NetworkConfig } from '../../network';
import { UserOperation } from '../../coeus-wasm';

export interface ITimestamp {
  epoch: number;
  unix: number;
  human: string;
}

export interface ITransactionResult {
  accept: string[];
  invalid: string[];
  errorResponse?: string;
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
  networkConfig: NetworkConfig;

  sendTx(tx: Interfaces.ITransactionJson): Promise<string>;

  sendMultipleTx(transactions: Interfaces.ITransactionJson[]): Promise<ITransactionResult>;

  getTxnStatus(txId: Sdk.TransactionId): Promise<Optional<ITransactionStatus>>;

  getWallet(address: string): Promise<Optional<IWalletResponse>>;

  getWalletNonce(address: string): Promise<bigint>;

  getWalletBalance(address: string): Promise<bigint>;

  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;

  getCurrentHeight(): Promise<number>;
}

export interface IApi {
  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;

  getCurrentHeight(): Promise<number>;

  sendTransferTx(
    fromAddress: string,
    toAddress: string,
    amountFlake: bigint,
    hydraPrivate: HydraPrivate,
    nonce?: bigint,
    vendorField?: string,
    manualFee?: bigint,
  ): Promise<string>;

  sendTx(signedTx: Interfaces.ITransactionData): Promise<string>;

  sendMultipleTx(signedTxns: Interfaces.ITransactionData[]): Promise<ITransactionResult>;

  sendVoteTx(
    fromAddress: string,
    delegate: SecpPublicKey,
    hydraPrivate: HydraPrivate,
    nonce?: bigint,
    vendorField?: string,
    manualFee?: bigint,
  ): Promise<string>;

  sendUnvoteTx(
    fromAddress: string,
    delegate: SecpPublicKey,
    hydraPrivate: HydraPrivate,
    nonce?: bigint,
    vendorField?: string,
    manualFee?: bigint,
  ): Promise<string>;

  /**
  * @deprecated This method is deprecated in favor of sendTransferTx()
  */
  sendTransferTxWithWIF(
    fromWIF: string,
    toAddress: string,
    amountFlake: bigint,
    nonce?: bigint,
    vendorField?: string,
    manualFee?: bigint,
  ): Promise<string>;

  /**
  * @deprecated This method is deprecated in favor of sendTransferTx()
  */
  sendTransferTxWithPassphrase(
    fromPassphrase: string,
    toAddress: string,
    amountFlake: bigint,
    nonce?: bigint,
    vendorField?: string,
    manualFee?: bigint,
  ): Promise<string>;

  sendMorpheusTx(
    senderAddress: string,
    morpheusAsset: IMorpheusAsset,
    hydraPrivate: HydraPrivate,
    nonce?: bigint,
  ): Promise<string>;

  /**
  * @deprecated This method is deprecated in favor of sendMorpheusTx()
  */
  sendMorpheusTxWithWIF(
    attempts: IOperationData[],
    fromWIF: string,
    nonce?: bigint,
  ): Promise<string>;

  /**
  * @deprecated This method is deprecated in favor of sendMorpheusTx()
  */
  sendMorpheusTxWithPassphrase(
    attempts: IOperationData[],
    passphrase: string,
    nonce?: bigint,
  ): Promise<string>;

  sendCoeusTx(
    fromAddress: string,
    userOperations: UserOperation[],
    hydraPrivate: HydraPrivate,
    layer1SenderNonce?: bigint,
    layer2PublicKeyNonce?: bigint,
  ): Promise<string>;

  getTxnStatus(
    txId: Sdk.TransactionId,
  ): Promise<Optional<ITransactionStatus>>;

  getWallet(
    address: string,
  ): Promise<Optional<IWalletResponse>>;

  getWalletNonce(
    address: string,
  ): Promise<bigint>;

  getWalletBalance(
    address: string,
  ): Promise<bigint>;
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
