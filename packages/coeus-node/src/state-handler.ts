import { ICoeusAsset } from '@internet-of-people/coeus-proto';
import { IAppLog } from '@internet-of-people/hydra-plugin-core';
import { SignedOperations, State as CoeusState, SystemOperation } from '@internet-of-people/sdk-wasm';

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
  private readonly corrupted = false;

  public constructor(
    private readonly logger: IAppLog,
  ) {
  }

  public dryRun(): void {
    // TODO
  }

  public blockStarted(height: number): void {
    this.state.applySystemOperation(SystemOperation.startBlock(height));
  }

  public applyTransactionToState(change: IStateChange): void {
    try {
      // applySignedOperations must retrieve all the operations but arrays cannot be passed over wasm
      for (const ops of change.asset.signedOperations) {
        // KURVA NAGY TODO: right now if the latest operations fails, only that one will be reverted
        this.state.applySignedOperations(new SignedOperations(ops));
      }
    } catch (e) {
      this.logger.info(`Transaction could not be applied. Error: ${e}, TX: ${JSON.stringify(change)}`);
    }
  }

  public revertEmptyBlockFromState(_: IBlockHeightChange): void {
    // KURVA NAGY TODO
  }

  public revertTransactionFromState(_: IStateChange): void {
    // KURVA NAGY TODO
  }
}
