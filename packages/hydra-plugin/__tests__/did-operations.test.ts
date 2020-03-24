import Optional from 'optional-js';

import { IVault, KeyId, PersistentVault, SignedBytes, Vault } from '@internet-of-people/morpheus-core';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
const { Operations: { OperationAttemptsBuilder, DidDocument: { RightRegistry } } } = MorpheusTransaction;
import { IO } from '@internet-of-people/sdk';
type TransactionId = IO.TransactionId;

import { DidOperationExtractor, ITransactionRepository } from '../src/did-operations';

const defaultDid = new IO.Did('did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr');
const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
const keyId2 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
const transactionId = 'someTransactionId';

const rustVault = new Vault(PersistentVault.DEMO_PHRASE);
rustVault.createDid();
rustVault.createDid();
rustVault.createDid();

const vault: IVault = {
  signDidOperations: (keyId: KeyId, message: Uint8Array): SignedBytes => {
    return rustVault.signDidOperations(keyId, message);
  },
};


export class TransactionTestRepo implements ITransactionRepository {
  private transactions: { [txid: string]: Interfaces.IMorpheusAsset; } = {};

  public pushTransaction(txId: TransactionId, tx: Interfaces.IMorpheusAsset): void {
    this.transactions[txId] = tx;
  }
  public async getMorpheusTransaction(txId: TransactionId): Promise<Optional<Interfaces.IMorpheusAsset>> {
    const result = this.transactions[txId];
    return Optional.ofNullable(result);
  }
}


describe('DidOperationExtractor', () => {
  let extractor: DidOperationExtractor;

  const stateHandlerQueryMock = {
    lastSeenBlockHeight: jest.fn<number, []>(),
    isConfirmed: jest.fn<Optional<boolean>, [IO.TransactionId]>(),
    beforeProofExistsAt: jest.fn<boolean, [IO.ContentId, number|undefined]>(),
    getBeforeProofHistory: jest.fn<Interfaces.IBeforeProofHistory, [string]>(),
    getDidDocumentAt: jest.fn<Interfaces.IDidDocument, [IO.Did, number]>(),
    getDidTransactionIds: jest.fn<
    Interfaces.ITransactionIdHeight[],
    [IO.Did, boolean, number, number | undefined]
    >(),
  };

  const stateHandler = {
    query: stateHandlerQueryMock,
    dryRun: jest.fn<Interfaces.IDryRunOperationError[], [Interfaces.IOperationData[]]>(),
    applyEmptyBlockToState: jest.fn<void, [Interfaces.IBlockHeightChange]>(),
    applyTransactionToState: jest.fn<void, [Interfaces.IStateChange]>(),
    revertEmptyBlockFromState: jest.fn<void, [Interfaces.IBlockHeightChange]>(),
    revertTransactionFromState: jest.fn<void, [Interfaces.IStateChange]>(),
  };

  beforeEach(async() => {
    const repo = new TransactionTestRepo();

    const txAsset = {
      operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(defaultDid, null)
        .addKey(keyId2)
        .addRight(keyId2, RightRegistry.systemRights.impersonate)
        .addRight(keyId2, RightRegistry.systemRights.update)
        .sign(defaultKeyId)
        .getAttempts(),
    };
    repo.pushTransaction(transactionId, txAsset);
    extractor = new DidOperationExtractor(repo, stateHandler);
  });

  it('can filter operations for a specific DID', async() => {
    stateHandlerQueryMock.getDidTransactionIds.mockImplementationOnce(() => {
      return [{ transactionId, height: 1 }];
    });
    stateHandlerQueryMock.isConfirmed.mockImplementation(() => {
      return Optional.of(true);
    });
    const didOps = await extractor.didOperationsOf(defaultDid, false, 0);
    expect(didOps).toHaveLength(3);
  });

  it('repo does not throw for unknown transactions', async() => {
    stateHandlerQueryMock.getDidTransactionIds.mockImplementationOnce(() => {
      return [];
    });
    stateHandlerQueryMock.isConfirmed.mockImplementation(() => {
      return Optional.of(false);
    });
    const didOps = await extractor.didOperationsOf(new IO.Did('did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX'), true, 0);
    expect(didOps).toHaveLength(0);
  });
});
