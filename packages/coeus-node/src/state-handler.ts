import { ICoeusAsset } from '@internet-of-people/coeus-proto';
import { IAppLog } from '@internet-of-people/hydra-plugin-core';
import { CoeusAsset, CoeusState } from '@internet-of-people/node-wasm';

interface IBlockHeightChange {
  blockHeight: number;
  blockId: string;
}

interface IStateChange extends IBlockHeightChange {
  asset: ICoeusAsset;
  transactionId: string;
}

export class StateHandler {
  public static readonly COMPONENT_NAME: string = 'coeus-state-handler';
  public readonly state: CoeusState = new CoeusState();

  public constructor(
    private readonly logger: IAppLog,
  ) {
  }

  public dryRun(): void {
    // TODO
  }

  public blockApplying(height: number): void {
    try {
      this.state.blockApplying(height);
    } catch (e) {
      this.logger.info(`Block could not be applied. Error: ${e}`);
      throw e;
    }
  }

  public applyTransactionToState(change: IStateChange): void {
    try {
      this.state.applyTransaction(change.transactionId, new CoeusAsset(change.asset));
    } catch (e) {
      this.logger.info(`Transaction could not be applied. Error: ${e}, TX: ${JSON.stringify(change)}`);
    }
  }

  public blockReverted(height: number): void {
    try {
      this.state.blockReverted(height);
    } catch (e) {
      this.logger.info(`Block could not be reverted. Error: ${e}`);
    }
  }

  public revertTransactionFromState(change: IStateChange): void {
    try {
      this.state.revertTransaction(change.transactionId, new CoeusAsset(change.asset));
    } catch (e) {
      this.logger.info(`Transaction could not be reverted. Error: ${e}, TX: ${JSON.stringify(change)}`);
    }
  }
}
