import { Identities, Transactions, Utils } from '@arkecosystem/crypto';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { Layer1Api } from './layer1api';
import { askForPassphrase } from './utils';

const {
  Builder: { MorpheusTransactionBuilder },
} = MorpheusTransaction;

const { Address } = Identities;

const nextNonce = async(publicKey: string): Promise<Utils.BigNumber> => {
  const address = Identities.Address.fromPublicKey(publicKey);
  const currentNonce = await Layer1Api.get().getWalletNonce(address);
  return currentNonce.plus(1);
};

export const sendTransferTx = async(
  fromPassphrase: string,
  toAddress: string,
  amountArkToshi: Utils.BigNumber,
): Promise<string> => {
  const senderKeys = Identities.Keys.fromPassphrase(fromPassphrase);
  const nonce = await nextNonce(senderKeys.publicKey);

  const tx = Transactions.BuilderFactory.transfer()
    .amount(amountArkToshi.toFixed())
    .fee(Utils.BigNumber.make(0.1 * 1e8).toFixed())
    .nonce(nonce.toFixed())
    .recipientId(toAddress);

  const signedTx = tx
    .sign(fromPassphrase)
    .build()
    .toJson();

  return Layer1Api.get().sendTx(signedTx);
};

export const sendMorpheusTx = async(attempts: Interfaces.IOperationData[]): Promise<string> => {
  const txBuilder = new MorpheusTransactionBuilder();

  console.log('Creating tx...');
  const unsignedTx = txBuilder.fromOperationAttempts(attempts);

  console.log('Signing tx...');
  const passphrase = await askForPassphrase('gas address');
  // checking balance
  const keys = Identities.Keys.fromPassphrase(passphrase);
  const address = Address.fromPublicKey(keys.publicKey);
  const balance = await Layer1Api.get().getWalletBalance(address);

  if (balance.isLessThan(1)) {
    throw new Error('Low balance. Send some HYDs to the address you provided.');
  }

  const nonce = await nextNonce(keys.publicKey);
  unsignedTx.nonce(nonce.toFixed());

  const signedTx = unsignedTx.sign(passphrase).build()
    .toJson();
  return Layer1Api.get().sendTx(signedTx);
};
