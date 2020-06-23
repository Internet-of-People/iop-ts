import Optional from 'optional-js';

import { Crypto, Layer1, Types } from '@internet-of-people/sdk';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';

const { Operations: { RightRegistry } } = MorpheusTransaction;
type TransactionId = Types.Sdk.TransactionId;

import { DidOperationExtractor, ITransactionRepository } from '../src/did-operations';
import { defaultDid, did2, defaultKeyId, keyId2 } from './known-keys';
import { installWindowCrypto } from './utils';

installWindowCrypto();

export class TransactionTestRepo implements ITransactionRepository {
  private transactions: { [txid: string]: Types.Layer1.IMorpheusAsset; } = {};

  public pushTransaction(txId: TransactionId, tx: Types.Layer1.IMorpheusAsset): void {
    this.transactions[txId] = tx;
  }
  public async getMorpheusTransaction(txId: TransactionId): Promise<Optional<Types.Layer1.IMorpheusAsset>> {
    const result = this.transactions[txId];
    return Optional.ofNullable(result);
  }
}

describe('DidOperationExtractor', () => {
  const transactionId = 'someTransactionId';

  let signer: Crypto.MorpheusPrivate;
  let extractor: DidOperationExtractor;

  const stateHandlerQueryMock = {
    lastSeenBlockHeight: jest.fn<number, []>(),
    isConfirmed: jest.fn<Optional<boolean>, [TransactionId]>(),
    beforeProofExistsAt: jest.fn<boolean, [Types.Sdk.ContentId, number|undefined]>(),
    getBeforeProofHistory: jest.fn<Types.Layer2.IBeforeProofHistory, [string]>(),
    getDidDocumentAt: jest.fn<Types.Layer2.IDidDocument, [Crypto.Did, number]>(),
    getDidTransactionIds: jest.fn<
    Interfaces.ITransactionIdHeight[],
    [Crypto.Did, boolean, number, number | undefined]
    >(),
  };

  const stateHandler = {
    query: stateHandlerQueryMock,
    dryRun: jest.fn<Interfaces.IDryRunOperationError[], [Types.Layer1.IOperationData[]]>(),
    applyEmptyBlockToState: jest.fn<void, [Interfaces.IBlockHeightChange]>(),
    applyTransactionToState: jest.fn<void, [Interfaces.IStateChange]>(),
    revertEmptyBlockFromState: jest.fn<void, [Interfaces.IBlockHeightChange]>(),
    revertTransactionFromState: jest.fn<void, [Interfaces.IStateChange]>(),
  };

  beforeAll(() => {
    const unlockPassword = 'correct horse battery staple';
    const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPassword);
    Crypto.MorpheusPlugin.rewind(vault, unlockPassword);
    const m = Crypto.MorpheusPlugin.get(vault);
    signer = m.priv(unlockPassword);
    signer.personas.key(2); // creates 3 dids
  });

  beforeEach(async() => {
    const repo = new TransactionTestRepo();

    const txAsset = {
      operationAttempts: new Layer1.OperationAttemptsBuilder()
        .signWith(signer)
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
    const didOps = await extractor.didOperationsOf(did2, true, 0);
    expect(didOps).toHaveLength(0);
  });
});
