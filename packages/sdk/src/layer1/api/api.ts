import { Identities, Interfaces, Transactions, Managers, Errors } from '@arkecosystem/crypto';
import Optional from 'optional-js';
import { log, HydraPrivate, HydraTxBuilder, SecpKeyId, SecpPublicKey } from '@internet-of-people/morpheus-crypto';
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

  public async getTxnStatus(txId: string): Promise<Optional<Types.Layer1.ITransactionStatus>> {
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

  public async sendTransferTx(
    fromAddress: string,
    toAddress: string,
    amountFlake: BigInt,
    hydraPrivate: HydraPrivate,
    nonce?: BigInt,
  ): Promise<string> {
    const { network } = hydraPrivate;
    const tx = new HydraTxBuilder(network)
      .transfer(
        SecpKeyId.fromAddress(toAddress, network),
        hydraPrivate.pub.keyByAddress(fromAddress).publicKey(),
        amountFlake,
        nonce ?? await this.nextWalletNonceByAddress(fromAddress),
      );

    const signedTx = hydraPrivate.signHydraTransaction(fromAddress, tx);

    return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  }

  public async sendTx(signedTx: Interfaces.ITransactionData): Promise<string> {
    return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  }

  public async sendVoteTx(
    fromAddress: string,
    delegate: SecpPublicKey,
    hydraPrivate: HydraPrivate,
    nonce?: BigInt,
  ): Promise<string> {
    const { network } = hydraPrivate;
    const tx = new HydraTxBuilder(network)
      .vote(
        delegate,
        hydraPrivate.pub.keyByAddress(fromAddress).publicKey(),
        nonce ?? await this.nextWalletNonceByAddress(fromAddress),
      );

    const signedTx = hydraPrivate.signHydraTransaction(fromAddress, tx);

    return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  }

  public async sendUnvoteTx(
    fromAddress: string,
    delegate: SecpPublicKey,
    hydraPrivate: HydraPrivate,
    nonce?: BigInt,
  ): Promise<string> {
    const { network } = hydraPrivate;
    const tx = new HydraTxBuilder(network)
      .unvote(
        delegate,
        hydraPrivate.pub.keyByAddress(fromAddress).publicKey(),
        nonce ?? await this.nextWalletNonceByAddress(fromAddress),
      );

    const signedTx = hydraPrivate.signHydraTransaction(fromAddress, tx);

    return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  }

  public async sendTransferTxWithWIF(
    fromWIF: string,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  ): Promise<string> {
    const senderKeys = Identities.Keys.fromWIF(fromWIF);
    const address = Identities.Address.fromPublicKey(senderKeys.publicKey);
    const tx = await this.buildTransferTxWithAddress(address, toAddress, amountFlake, nonce);

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
    const address = Identities.Address.fromPublicKey(senderKeys.publicKey);
    const tx = await this.buildTransferTxWithAddress(address, toAddress, amountFlake, nonce);

    const signedTx = tx
      .sign(fromPassphrase)
      .build()
      .toJson();

    return this.clientInstance.sendTx(signedTx);
  }

  // public async sendMorpheusTx(
  //   gasAddress: string,
  //   attempts: Types.Layer1.IOperationData[],
  //   hydraPrivate: HydraPrivate,
  //   nonce?: BigInt,
  // ): Promise<string> {
  //   const network = hydraPrivate.network;
  //   const tx = new MorpheusTxBuilder(network)
  //     .build(
  //       attempts,
  //       hydraPrivate.pub.keyByAddress(gasAddress).publicKey(),
  //       nonce ?? await this.nextWalletNonceByAddress(gasAddress)
  //     );

  //   const signedTx = hydraPrivate.signHydraTransaction(gasAddress, tx);

  //   return this.clientInstance.sendTx(signedTx as unknown as Interfaces.ITransactionJson);
  // }

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

  public async nextWalletNonceByAddress(address: string): Promise<BigInt> {
    const currentNonce = await this.clientInstance.getWalletNonce(address);
    const nextNonce = currentNonce as bigint + BigInt(1);
    log(`Current nonce is ${currentNonce}, next nonce is ${nextNonce}`);
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
      log(`Current nonce is ${currentNonce}, next nonce is ${nextNonce}`);
    }
    unsignedTx.nonce(nextNonce.toString());

    return unsignedTx;
  }

  private async buildTransferTxWithAddress(
    address: string,
    toAddress: string,
    amountFlake: BigInt,
    nonce?: BigInt,
  /* eslint @typescript-eslint/no-explicit-any: 0 */
  ): Promise<Transactions.TransactionBuilder<any>> {
    let nextNonce = nonce;

    if (!nextNonce) {
      nextNonce = await this.nextWalletNonceByAddress(address);
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
    if (
      !(e instanceof Errors.TransactionAlreadyRegisteredError) &&
      (e.message && e.message.indexOf('Error.captureStackTrace is not a function') === -1)
    ) {
      throw e;
    }
  }
  return api;
};
