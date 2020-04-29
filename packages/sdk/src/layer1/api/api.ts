import { Identities, Transactions, Managers, Utils } from '@arkecosystem/crypto';
import { MorpheusTransaction } from '../transaction';
import * as Types from '../../types';
import * as Layer1 from '../../layer1';
import { Network } from '../../network';
import { AxiosClient } from './client';

export class Api implements Types.Layer1.IApi {
  private readonly clientInstance: Types.Layer1.IClient;

  public constructor(network: Network) {
    this.clientInstance = new AxiosClient(network);
  }

  public get client(): Types.Layer1.IClient {
    return this.clientInstance;
  }

  public async sendTransferTx(
    fromPassphrase: string,
    toAddress: string,
    amountFlake: Utils.BigNumber,
  ): Promise<string> {
    const senderKeys = Identities.Keys.fromPassphrase(fromPassphrase);
    const nonce = await this.nextWalletNonce(senderKeys.publicKey);

    const tx = Transactions.BuilderFactory.transfer()
      .amount(amountFlake.toFixed())
      .fee(Utils.BigNumber.make(0.1 * 1e8).toFixed())
      .nonce(nonce.toFixed())
      .recipientId(toAddress);

    const signedTx = tx
      .sign(fromPassphrase)
      .build()
      .toJson();

    return this.clientInstance.sendTx(signedTx);
  }

  public async sendMorpheusTx(attempts: Types.Layer1.IOperationData[], passphrase: string): Promise<string> {
    const txBuilder = new Layer1.MorpheusTransactionBuilder();
    const unsignedTx = txBuilder.fromOperationAttempts(attempts);

    // checking balance
    const keys = Identities.Keys.fromPassphrase(passphrase);
    const address = Identities.Address.fromPublicKey(keys.publicKey);
    const wallet = await this.clientInstance.getWallet(address);
    const balance = wallet.isPresent() ? Utils.BigNumber.make(wallet.get().balance) : Utils.BigNumber.ZERO;

    if (balance.isLessThan(1)) {
      throw new Error('Low balance. Send some HYDs to the address you provided.');
    }

    let nonce = wallet.isPresent() ? Utils.BigNumber.make(wallet.get().nonce) : Utils.BigNumber.ZERO;
    nonce = nonce.plus(1);
    unsignedTx.nonce(nonce.toFixed());

    const signedTx = unsignedTx.sign(passphrase).build()
      .toJson();
    return this.clientInstance.sendTx(signedTx);
  }

  public async nextWalletNonce(publicKey: string): Promise<Utils.BigNumber> {
    const address = Identities.Address.fromPublicKey(publicKey);
    const currentNonce = await this.clientInstance.getWalletNonce(address);
    return currentNonce.plus(1);
  }
}

export const createApi = async(network: Network): Promise<Types.Layer1.IApi> => {
  const api = new Api(network);

  const [ cryptoConfig, height ] = await Promise.all([
    api.client.getNodeCryptoConfig(),
    api.client.getCurrentHeight(),
  ]);
  Managers.configManager.setConfig(cryptoConfig);
  Managers.configManager.setHeight(height);
  Transactions.TransactionRegistry.registerTransactionType(MorpheusTransaction);
  return api;
};
