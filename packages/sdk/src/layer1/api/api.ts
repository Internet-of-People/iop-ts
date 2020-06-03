import { Identities, Interfaces, Transactions, Managers, Errors } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { MorpheusTransaction } from '../transaction';
import * as Types from '../../types';
import * as Layer1 from '../../layer1';
import { Network } from '../../network';
import { AxiosClient } from './client';
import { MorpheusTransactionBuilder } from '../transaction-builder';


export class Api implements Types.Layer1.IApi {
  private readonly clientInstance: Types.Layer1.IClient;

  public constructor(network: Network) {
    this.clientInstance = new AxiosClient(network);
  }

  public async getNodeCryptoConfig(): Promise<Interfaces.INetworkConfig> {
    return this.clientInstance.getNodeCryptoConfig();
  }

  public async getCurrentHeight(): Promise<number> {
    return this.clientInstance.getCurrentHeight();
  }

  public async getTxnStatus(txId: string): Promise<Optional<Interfaces.ITransactionJson>> {
    return this.clientInstance.getTxnStatus(txId);
  }

  public async getWallet(address: string): Promise<Optional<Types.Layer1.IWalletResponse>> {
    return this.clientInstance.getWallet(address);
  }

  public async getWalletNonce(address: string): Promise<BigInt> {
    return this.clientInstance.getWalletNonce(address);
  }

  public async getWalletBalance(address: string): Promise<BigInt> {
    return this.clientInstance.getWalletBalance(address);
  }

  public async sendTransferTxWithWIF(
    fromWIF: string,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  ): Promise<string> {
    const senderKeys = Identities.Keys.fromWIF(fromWIF);
    const tx = await this.buildTransferTx(senderKeys, toAddress, amountFlake, nonce);

    const signedTx = tx
      .signWithWif(fromWIF)
      .getStruct();

    return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  }

  public async sendTransferTxWithPassphrase(
    fromPassphrase: string,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  ): Promise<string> {
    const senderKeys = Identities.Keys.fromPassphrase(fromPassphrase);
    const tx = await this.buildTransferTx(senderKeys, toAddress, amountFlake, nonce);

    const signedTx = tx
      .sign(fromPassphrase)
      .build()
      .toJson();

    return this.clientInstance.sendTx(signedTx);
  }

  public async sendMorpheusTxWithWIF(
    attempts: Types.Layer1.IOperationData[],
    fromWIF: string,
    nonce?: BigInt,
  ): Promise<string> {
    const keys = Identities.Keys.fromWIF(fromWIF);
    const unsignedTx = await this.buildMorpheusTx(
      keys,
      attempts,
      nonce,
    );

    const signedTx = unsignedTx
      .signWithWif(fromWIF)
      .getStruct();

    return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  }

  public async sendMorpheusTxWithPassphrase(
    attempts: Types.Layer1.IOperationData[],
    fromPassphrase: string,
    nonce?: BigInt,
  ): Promise<string> {
    const keys = Identities.Keys.fromPassphrase(fromPassphrase);
    const unsignedTx = await this.buildMorpheusTx(
      keys,
      attempts,
      nonce,
    );

    const signedTx = unsignedTx
      .sign(fromPassphrase)
      .build()
      .toJson();
    return this.clientInstance.sendTx(signedTx);
  }

  public async nextWalletNonce(publicKey: string): Promise<BigInt> {
    const address = Identities.Address.fromPublicKey(publicKey);
    const currentNonce = await this.clientInstance.getWalletNonce(address);
    const nextNonce = currentNonce as bigint + BigInt(1);
    console.log(`Current nonce is ${currentNonce}, next nonce is ${nextNonce}`);
    return nextNonce;
  }

  private async buildMorpheusTx(
    from: Interfaces.IKeyPair,
    attempts: Types.Layer1.IOperationData[],
    nonce?: BigInt,
  ): Promise<MorpheusTransactionBuilder> {
    const txBuilder = new Layer1.MorpheusTransactionBuilder();
    const unsignedTx = txBuilder.fromOperationAttempts(attempts);

    // checking balance
    const address = Identities.Address.fromPublicKey(from.publicKey);
    const wallet = await this.clientInstance.getWallet(address);
    const balance = wallet.isPresent() ? BigInt(wallet.get().balance) : BigInt(0);

    if (balance < BigInt('10000000')) { // 0.1 HYD in flakes (HYD*1e8)
      throw new Error('Low balance. Send some HYDs to the address you provided.');
    }

    let nextNonce = nonce;

    if (!nextNonce) {
      const currentNonce = wallet.isPresent() ? BigInt(wallet.get().nonce) : BigInt(0);
      nextNonce = currentNonce + BigInt(1);
      console.log(`Current nonce is ${currentNonce}, next nonce is ${nextNonce}`);
    }
    unsignedTx.nonce(nextNonce.toString());

    return unsignedTx;
  }

  private async buildTransferTx(
    from: Interfaces.IKeyPair,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  /* eslint @typescript-eslint/no-explicit-any: 0 */
  ): Promise<Transactions.TransactionBuilder<any>> {
    let nextNonce = nonce;

    if (!nextNonce) {
      nextNonce = await this.nextWalletNonce(from.publicKey);
    }

    return Transactions.BuilderFactory.transfer()
      .amount(amountFlake.toString())
      .fee(BigInt(0.1 * 1e8).toString())
      .nonce(nextNonce.toString())
      .recipientId(toAddress);
  }
}

export const createApi = async(network: Network): Promise<Types.Layer1.IApi> => {
  const api = new Api(network);

  const [ cryptoConfig, height ] = await Promise.all([
    api.getNodeCryptoConfig(),
    api.getCurrentHeight(),
  ]);
  Managers.configManager.setConfig(cryptoConfig);
  Managers.configManager.setHeight(height);

  try {
    Transactions.TransactionRegistry.registerTransactionType(MorpheusTransaction);
  } catch (e) {
    // using the SDK hot reloaders might call this multiple times in one iteration
    if (!(e instanceof Errors.TransactionAlreadyRegisteredError)) {
      throw e;
    }
  }
  return api;
};
