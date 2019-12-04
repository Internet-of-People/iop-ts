import { Connection } from '@arkecosystem/client';
import { Identities, Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { MorpheusTransaction } from "@internet-of-people/did-manager";
import inquirer from "inquirer";

const {
  Builder: { MorpheusTransactionBuilder },
  Operations: { OperationAttemptsBuilder }
} = MorpheusTransaction;
const { Address } = Identities;

export class BeforeProofExample {
  public static readonly ID: string = 'before-proof';

  private static async askForPassphrase(): Promise<string> {
    const result = await inquirer.prompt([{
      name: 'passphrase',
      message: 'Type your passphrase below:',
      type: 'password',
    }]);
    if(!result.passphrase) {
      throw new Error('Passphrase must not be empty.');
    }
    return result.passphrase;
  }

  private static async askForNetwork(): Promise<string> {
    const result = await inquirer.prompt([{
      name: 'network',
      message: 'Choose network:',
      type: 'list',
      choices: ['testnet', 'devnet', 'mainnet'],
    }]);
    return result.network;
  }

  private static async askForAction(): Promise<string> {
    const result = await inquirer.prompt([{
      name: 'action',
      message: 'Choose action:',
      type: 'list',
      choices: ['register', 'revoke'],
    }]);
    return result.action;
  }

  private static getPrefixHash(network: string): number {
    switch (network) {
      case 'testnet':
        return 128;
      case 'devnet':
        return 90;
      case 'mainnet':
        return 100;
      default:
        throw new Error(`Unknown network ${network}`);
    }
  }

  private static getConnection(network: string): Connection {
    switch (network) {
      case 'testnet':
        return new Connection('http://127.0.0.1:4703/api/v2');
      case 'devnet':
        return new Connection('http://35.240.62.119:4703/api/v2');
      case 'mainnet':
        return new Connection('http://35.195.150.223:4703/api/v2');
      default:
        throw new Error(`Unknown network ${network}`);
    }
  }

  // Note: this function helps you to transfer some funds from one address to an another one during a demo if the
  // desktop wallet does not work.
  private static async sendInitialTransactionToDemoAccount(connection: Connection): Promise<void> {
    const result = await inquirer.prompt([{
      name: 'passphrase',
      message: 'Type fund\'s passphrase below:',
      type: 'password',
    }]);

    // TODO: DO NOT USE their client library, use their RPC endpoints
    const tx = Transactions.BuilderFactory.transfer()
      .amount(Utils.BigNumber.make(1000 * 1e8).toFixed()) // 10 test hydras, multiplied by 10^8 to get arktoshi value
      .fee(Utils.BigNumber.make(0.1 * 1e8).toFixed())
      // .nonce('1')
      // .expiration(50)
      .version(2)
      .recipientId('tsLXnKUSXvPnwZXNFXiKQ6jcXBet4nmPP6');

    // substracting testnet's epoch from now TODO: make it network independent
    tx.data.timestamp = Math.floor((new Date(new Date().toUTCString()).getTime() - new Date('2019-08-01T08:00:00.000Z').getTime()) / 1000);

    const signedTx = tx
      .sign(result.passphrase)
      .getStruct();
    await connection
      .api('transactions')
      .create({ transactions: [signedTx] });
    console.log('Transfered(?)');
  }

  public async run(): Promise<void> {
    const action = await BeforeProofExample.askForAction();
    const network = await BeforeProofExample.askForNetwork();
    const prefixHash = BeforeProofExample.getPrefixHash(network);
    const connection = BeforeProofExample.getConnection(network);

    await BeforeProofExample.sendInitialTransactionToDemoAccount(connection);

    if(action === 'register') {
      await this.register(connection, prefixHash);
    }
    else if(action === 'revoke') {
      // TODO
    }
    else {
      throw new Error(`Unknown action ${action}.`);
    }
  }

  private async register(connection: Connection, prefixHash: number): Promise<void> {
    const result = await inquirer.prompt([{
      name: 'contentId',
      message: 'Type your contentId below:',
    }]);
    if(!result.contentId) {
      throw new Error('ContentId must not be empty.');
    }

    const txBuilder = new MorpheusTransactionBuilder();
    const opBuilder = new OperationAttemptsBuilder();

    console.log('Creating tx...');
    const unsignedTx = txBuilder.fromOperationAttempts(opBuilder.registerBeforeProof(result.contentId));

    console.log('Signing tx...');
    const passphrase = await BeforeProofExample.askForPassphrase();
    const keys = Identities.Keys.fromPassphrase(passphrase);
    const address = Address.fromPublicKey(keys.publicKey, prefixHash);
    console.log(`Retrieving balance of ${address}...`);
    const balance = await this.getBalance(connection, address);
    console.log(`Balance is ${balance}`);
    if(balance.isLessThan(1)) {
      throw new Error('Low balance. Send some HYDs to the address you provided.');
    }
    const signedTx = unsignedTx.sign(passphrase);

    console.log('Preparing tx...');
    const txData = signedTx.getStruct();
    await this.sendTx(connection, txData);
    console.log('hello');
  }

  private async sendTx(connection: Connection, txData: Interfaces.ITransactionData): Promise<void> {
    console.log('Sending tx...');
    const resp = await connection.api('transactions').create({transactions:[txData]});
    console.log(resp);
  }

  private async getBalance(connection: Connection, address: string): Promise<Utils.BigNumber> {
    let balance = Utils.BigNumber.ZERO;
    try {
      const resp = await connection.api('wallets').get(address);
      balance = Utils.BigNumber.make(resp.data.balance);
    } catch(e){
      console.log(e.message);
    }
    return balance;
  }
}
