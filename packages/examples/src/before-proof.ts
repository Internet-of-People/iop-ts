import { MorpheusTransaction } from '@internet-of-people/did-manager';
import inquirer from 'inquirer';
import {TransactionSender} from './transaction-sender';

const {
  Operations: { OperationAttemptsBuilder }
} = MorpheusTransaction;

export class BeforeProofExample {
  public static readonly ID: string = 'before-proof';

  private static async askForAction(): Promise<string> {
    const result = await inquirer.prompt([{
      name: 'action',
      message: 'Choose action:',
      type: 'list',
      choices: ['register', 'revoke'],
    }]);
    return result.action;
  }

  private static async register(): Promise<void> {
    const result = await inquirer.prompt([{
      name: 'contentId',
      message: 'Type your contentId below:',
    }]);
    if(!result.contentId) {
      throw new Error('ContentId must not be empty.');
    }

    const opBuilder = new OperationAttemptsBuilder();
    const id = await TransactionSender.sendMorpheusTx(opBuilder.registerBeforeProof(result.contentId).getAttempts());
    console.log(`Register before proof tx send, id: ${id}`);
  }

  private static async revoke(): Promise<void> {
    const result = await inquirer.prompt([{
      name: 'contentId',
      message: 'Type your contentId below:',
    }]);
    if(!result.contentId) {
      throw new Error('ContentId must not be empty.');
    }

    const opBuilder = new OperationAttemptsBuilder();
    const id = await TransactionSender.sendMorpheusTx(opBuilder.revokeBeforeProof(result.contentId).getAttempts());
    console.log(`Revoke before proof tx send, id: ${id}`);
  }

  public async run(): Promise<void> {
    const action = await BeforeProofExample.askForAction();
    if(action === 'register') {
      await BeforeProofExample.register();
    }
    else if(action === 'revoke') {
      await BeforeProofExample.revoke();
    }
    else {
      throw new Error(`Unknown action ${action}.`);
    }
  }
}
