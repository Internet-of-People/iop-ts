import Optional from 'optional-js';

import { Interfaces as KvInterfaces, KeyId, PersistentVault, SignedMessage, Vault } from '@internet-of-people/keyvault';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';

import { DidOperationExtractor, ITransactionRepository } from '../src/did-operations';

const { Operations: { OperationAttemptsBuilder, DidDocument: { RightRegistry } } } = MorpheusTransaction;

const defaultDid = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
const keyId2 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
const transactionId = 'someTransactionId';

const rustVault = new Vault(PersistentVault.DEMO_PHRASE);
rustVault.createId();
rustVault.createId();
rustVault.createId();

const vault: KvInterfaces.IVault = {
  sign: (message: Uint8Array, keyId: KeyId): SignedMessage => {
    return rustVault.sign(keyId, message);
  },
};


export class TransactionTestRepo implements ITransactionRepository {
  private transactions: { [txid: string]: Interfaces.IMorpheusAsset; } = {};

  public pushTransaction(txId: Interfaces.TransactionId, tx: Interfaces.IMorpheusAsset): void {
    this.transactions[txId] = tx;
  }
  public async getMorpheusTransaction(txId: Interfaces.TransactionId): Promise<Optional<Interfaces.IMorpheusAsset>> {
    const result = this.transactions[txId];
    return Optional.ofNullable(result);
  }
}


describe('DidOperationExtractor', () => {
  let extractor: DidOperationExtractor;

  const stateHandlerQueryMock = {
    lastSeenBlockHeight: jest.fn<number, []>(),
    isConfirmed: jest.fn<Optional<boolean>, [string]>(),
    beforeProofExistsAt: jest.fn<boolean, [string, number|undefined]>(),
    getDidDocumentAt: jest.fn<Interfaces.IDidDocument, [Interfaces.Did, number]>(),
    getDidTransactionIds: jest.fn<Interfaces.ITransactionIdHeight[],
    [Interfaces.Did, boolean, number, number | undefined]>(),
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

  it('repo throws for unknown transactions', async() => {
    stateHandlerQueryMock.getDidTransactionIds.mockImplementationOnce(() => {
      return [];
    });
    stateHandlerQueryMock.isConfirmed.mockImplementation(() => {
      return Optional.of(false);
    });
    const didOps = await extractor.didOperationsOf('unknownDid', true, 0);
    expect(didOps).toHaveLength(0);
  });
});
