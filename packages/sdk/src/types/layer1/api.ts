import { Interfaces, Utils } from '@arkecosystem/crypto';
import { IOperationData } from './operation-data';

export interface IClient {
  sendTx(tx: Interfaces.ITransactionJson): Promise<string>;
  getWalletNonce(address: string): Promise<Utils.BigNumber>;
  getWalletBalance(address: string): Promise<Utils.BigNumber>;
  getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig>;
  getCurrentHeight(): Promise<number>;
}

export interface IApi {
  readonly client: IClient;
  sendTransferTx(fromPassphrase: string, toAddress: string, amountArkToshi: Utils.BigNumber): Promise<string>;
  sendMorpheusTx(attempts: IOperationData[], passphrase: string): Promise<string>;
}
