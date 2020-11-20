import { Interfaces } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { HydraPrivate, SecpPublicKey } from '@internet-of-people/morpheus-crypto';
import { IOperationData } from './operation-data';
import { Sdk } from '../index';
import { NetworkConfig } from '../../network';
import { UserOperation } from '../../coeus-wasm';

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
  networkConfig: NetworkConfig;

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

  sendTransferTx(
    fromAddress: string,
    toAddress: string,
    amountFlake: BigInt,
    hydraPrivate: HydraPrivate,
    nonce?: BigInt,
  ): Promise<string>;

  sendTx(signedTx: Interfaces.ITransactionData): Promise<string>;

  sendVoteTx(
    fromAddress: string,
    delegate: SecpPublicKey,
    hydraPrivate: HydraPrivate,
    nonce?: BigInt,
  ): Promise<string>;

  sendUnvoteTx(
    fromAddress: string,
    delegate: SecpPublicKey,
    hydraPrivate: HydraPrivate,
    nonce?: BigInt,
  ): Promise<string>;

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
    fromWIF: string,
    nonce?: BigInt,
  ): Promise<string>;

  sendMorpheusTxWithPassphrase(
    attempts: IOperationData[],
    passphrase: string,
    nonce?: BigInt,
  ): Promise<string>;

  sendCoeusTx(
    fromAddress: string,
    userOperations: UserOperation[],
    hydraPrivate: HydraPrivate,
    layer1SenderNonce?: BigInt,
    layer2PublicKeyNonce?: BigInt,
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
