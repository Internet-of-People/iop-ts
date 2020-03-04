/* eslint no-undefined: 0 */
import { Server as HapiServer } from '@hapi/hapi';
import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { IAppLog } from '@internet-of-people/logger';
import { createServer } from '@arkecosystem/core-http-utils';
import Optional from 'optional-js';
import { Interfaces as KvInterfaces, KeyId, PersistentVault, SignedMessage, Vault } from '@internet-of-people/keyvault';
import { EventEmitter } from 'events';
import { Layer2API, safePathInt } from '../src/layer2-api';
import { TransactionTestRepo } from './did-operations.test';
import { IDidOperation } from '../src/did-operations';

const {
  Operations: { OperationAttemptsBuilder, DidDocument: { RightRegistry }, DidDocument },
  MorpheusStateHandler: { MorpheusStateHandler },
} = MorpheusTransaction;
type TransactionId = Interfaces.TransactionId;
type Authentication = Interfaces.Authentication;
type IDidDocumentData = Interfaces.IDidDocumentData;
type Did = Interfaces.Did;

const defaultDid = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
const did2 = 'did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX';
const did3 = 'did:morpheus:ezkXs7Xd8SDWLaGKUAjEf53W';
const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
const keyId2 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
const keyId3 = new KeyId('iezkXs7Xd8SDWLaGKUAjEf53W');

const contentId = 'myFavoriteContentId';
const transactionId = 'myFavoriteTxid';
const blockId = 'myFavoriteBlockId';
const blockHeight = 5;

const rustVault = new Vault(PersistentVault.DEMO_PHRASE);
rustVault.createId();
rustVault.createId();
rustVault.createId();

const vault: KvInterfaces.IVault = {
  sign: (message: Uint8Array, keyId: KeyId): SignedMessage => {
    return rustVault.sign(keyId, message);
  },
};


class Fixture {
  public emitter: NodeJS.EventEmitter = new EventEmitter();

  public logMock = {
    appName: 'hot-wallet-tests',
    debug: jest.fn<void, [string]>(),
    info: jest.fn<void, [string]>(),
    warn: jest.fn<void, [string]>(),
    error: jest.fn<void, [string]>(),
  };
  public log = this.logMock as IAppLog;
  public transactionRepo = new TransactionTestRepo();

  public stateHandler = new MorpheusStateHandler(this.log, this.emitter);
}

let hapiServer: HapiServer;
let fixture: Fixture;

describe('Layer2API', () => {
  let lastTxId: TransactionId | null = null;

  const addKey = (
    key: Authentication,
    height: number,
    txId: string,
    signer: Authentication,
  ): void => {
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(defaultDid, lastTxId)
        .addKey(key)
        .sign(signer)
        .getAttempts(),
      },
      blockHeight: height,
      blockId,
      transactionId: txId,
    });
  };

  const revokeKey = (
    key: Authentication,
    height: number,
    txId: string,
    signer: Authentication,
  ): void => {
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(defaultDid, lastTxId)
        .revokeKey(key)
        .sign(signer)
        .getAttempts(),
      },
      blockHeight: height,
      blockId,
      transactionId: txId,
    });
  };

  const addRight = (
    key: Authentication,
    height: number,
    txId: string,
    signer: Authentication,
  ): void => {
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(defaultDid, lastTxId)
        .addRight(key, RightRegistry.systemRights.update)
        .sign(signer)
        .getAttempts(),
      },
      blockHeight: height,
      blockId,
      transactionId: txId,
    });
  };

  const revokeRight = (
    key: Authentication,
    height: number,
    txId: string,
    signer: Authentication,
  ): void => {
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(defaultDid, lastTxId)
        .revokeRight(key, RightRegistry.systemRights.update)
        .sign(signer)
        .getAttempts(),
      },
      blockHeight: height,
      blockId,
      transactionId: txId,
    });
  };

  const tombstoneDid = (height: number, txId: string, signer: Authentication): void => {
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(defaultDid, lastTxId)
        .tombstoneDid()
        .sign(signer)
        .getAttempts(),
      },
      blockHeight: height,
      blockId,
      transactionId: txId,
    });
  };

  beforeEach(async() => {
    fixture = new Fixture();
    lastTxId = null;
    hapiServer = await createServer({ host: '0.0.0.0', port: '4703' });
    const morpheusServer = new Layer2API(fixture.log, fixture.stateHandler, hapiServer, fixture.transactionRepo);
    morpheusServer.init();
  });

  afterEach(async() => {
    await hapiServer.stop();
  });

  it('unregistered content does not exist', async() => {
    const res = await hapiServer.inject({
      method: 'get',
      url: '/before-proof/invalid_content_id/exists',
    });
    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe(JSON.stringify(false));
  });

  it('registered content exists only from its height', async() => {
    const registrationAttempt = new OperationAttemptsBuilder()
      .registerBeforeProof(contentId)
      .getAttempts();
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight,
      blockId,
      transactionId,
    });

    const res5 = await hapiServer.inject({
      method: 'get',
      url: `/before-proof/${contentId}/exists/${blockHeight}`,
    });
    expect(res5.statusCode).toBe(200);
    expect(res5.payload).toBe(JSON.stringify(true));

    const resLatest = await hapiServer.inject({
      method: 'get',
      url: `/before-proof/${contentId}/exists`,
    });
    expect(resLatest.statusCode).toBe(200);
    expect(resLatest.payload).toBe(JSON.stringify(true));

    const res4 = await hapiServer.inject({
      method: 'get',
      url: `/before-proof/${contentId}/exists/${blockHeight - 1}`,
    });
    expect(res4.statusCode).toBe(200);
    expect(res4.payload).toBe(JSON.stringify(false));
  });

  it('can query implicit did', async() => {
    fixture.stateHandler.applyEmptyBlockToState({ blockHeight: 100, blockId: 'SomeBlockId' });
    const res = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document` });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload) as IDidDocumentData;
    const doc = new DidDocument.DidDocument(data);

    expect(data.keys).toHaveLength(1);
    expect(data.keys[0].auth).toStrictEqual(defaultKeyId.toString());
    expect(doc.height).toBe(100); // the current chain height
    expect(doc.did).toBe(defaultDid);
    expect(doc.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 0)).toBeTruthy();
    expect(doc.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 0)).toBeTruthy();
    expect(doc.isTombstonedAt(0)).toBeFalsy();
  });

  it('can add key to did', async() => {
    addKey(keyId2, 10, transactionId, defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));

    const res = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${10}` });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload) as IDidDocumentData;
    const doc = new DidDocument.DidDocument(data);

    expect(data.keys).toHaveLength(2);
    expect(data.keys[0].auth).toStrictEqual(defaultKeyId.toString());
    expect(data.keys[1].auth).toStrictEqual(keyId2.toString());
    expect(data.keys[0].valid).toBeTruthy();
    expect(data.keys[1].valid).toBeTruthy();
    expect(doc.did).toBe(defaultDid);
    expect(doc.height).toBe(10);
    expect(doc.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 10)).toBeTruthy();
    expect(doc.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 10)).toBeTruthy();
    expect(doc.isTombstonedAt(10)).toBeFalsy();
  });

  it('can revoke key from did', async() => {
    addKey(keyId2, 10, 'tx1', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';

    revokeKey(keyId2, 15, 'tx2', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));

    const res10 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${10}` });
    expect(res10.statusCode).toBe(200);
    const doc10 = JSON.parse(res10.payload) as IDidDocumentData;
    expect(doc10.queriedAtHeight).toBe(10);
    expect(doc10.keys).toHaveLength(2);
    expect(doc10.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(doc10.keys[1].auth.toString()).toStrictEqual(keyId2.toString());
    expect(doc10.keys[0].valid).toBeTruthy();
    expect(doc10.keys[1].valid).toBeTruthy();

    const res15 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${15}` });
    expect(res15.statusCode).toBe(200);
    const doc15 = JSON.parse(res15.payload) as IDidDocumentData;
    expect(doc15.queriedAtHeight).toBe(15);
    expect(doc15.keys).toHaveLength(2);
    expect(doc15.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(doc15.keys[1].auth.toString()).toStrictEqual(keyId2.toString());
    expect(doc15.keys[0].valid).toBeTruthy();
    expect(doc15.keys[1].valid).toBeFalsy();
  });

  it('can add right to a key', async() => {
    addKey(keyId2, 10, 'tx1', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';

    addRight(keyId2, 15, 'tx2', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));

    const res15 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${15}` });
    expect(res15.statusCode).toBe(200);
    const data15 = JSON.parse(res15.payload) as IDidDocumentData;
    const doc15 = new DidDocument.DidDocument(data15);
    expect(data15.keys).toHaveLength(2);
    expect(data15.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data15.keys[1].auth.toString()).toStrictEqual(keyId2.toString());
    expect(data15.keys[0].valid).toBeTruthy();
    expect(data15.keys[1].valid).toBeTruthy();
    expect(doc15.height).toBe(15);
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 15)).toBeTruthy();
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 15)).toBeTruthy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 15)).toBeFalsy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.update, 15)).toBeTruthy();
  });

  it('cannot add right to a non-existent key', async() => {
    addRight(keyId2, 15, transactionId, defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));

    const res15 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${15}` });
    expect(res15.statusCode).toBe(200);
    const data15 = JSON.parse(res15.payload) as IDidDocumentData;
    const doc15 = new DidDocument.DidDocument(data15);
    expect(data15.keys).toHaveLength(1);
    expect(data15.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data15.keys[0].valid).toBeTruthy();
    expect(doc15.height).toBe(15);
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 15)).toBeFalsy();
  });

  it('can revoke right from a key', async() => {
    addKey(keyId2, 10, 'tx1', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addRight(keyId2, 15, 'tx2', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';

    revokeRight(keyId2, 20, 'tx3', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));

    const res15 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${15}` });
    expect(res15.statusCode).toBe(200);
    const data15 = JSON.parse(res15.payload) as IDidDocumentData;
    const doc15 = new DidDocument.DidDocument(data15);
    expect(data15.keys).toHaveLength(2);
    expect(data15.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data15.keys[1].auth.toString()).toStrictEqual(keyId2.toString());
    expect(data15.keys[0].valid).toBeTruthy();
    expect(data15.keys[1].valid).toBeTruthy();
    expect(doc15.height).toBe(15);
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 15)).toBeTruthy();
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 15)).toBeTruthy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 15)).toBeFalsy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.update, 15)).toBeTruthy();

    const res20 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${20}` });
    expect(res20.statusCode).toBe(200);
    const data20 = JSON.parse(res20.payload) as IDidDocumentData;
    const doc20 = new DidDocument.DidDocument(data20);
    expect(data20.keys).toHaveLength(2);
    expect(data20.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data20.keys[1].auth.toString()).toStrictEqual(keyId2.toString());
    expect(data20.keys[0].valid).toBeTruthy();
    expect(data20.keys[1].valid).toBeTruthy();
    expect(doc20.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 20)).toBeTruthy();
    expect(doc20.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 20)).toBeTruthy();
    expect(doc20.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 20)).toBeFalsy();
    expect(doc20.hasRightAt(keyId2, RightRegistry.systemRights.update, 20)).toBeFalsy();
  });

  it('cannot revoke right from a non-existent key', async() => {
    addRight(keyId2, 15, 'tx2', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));

    revokeRight(keyId2, 20, 'tx3', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(false));

    const res20 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${20}` });
    expect(res20.statusCode).toBe(200);
    const data20 = JSON.parse(res20.payload) as IDidDocumentData;
    const doc20 = new DidDocument.DidDocument(data20);
    expect(data20.keys).toHaveLength(1);
    expect(data20.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data20.keys[0].valid).toBeTruthy();
    expect(doc20.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 20)).toBeTruthy();
    expect(doc20.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 20)).toBeTruthy();
    expect(doc20.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 20)).toBeFalsy();
    expect(doc20.hasRightAt(keyId2, RightRegistry.systemRights.update, 20)).toBeFalsy();
  });

  it('cannot update did if has no update right', async() => {
    addKey(keyId2, 10, 'tx1', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addKey(keyId3, 10, 'tx2', defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';

    addRight(keyId3, 15, 'tx3', keyId2);
    expect(fixture.stateHandler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(false));

    const res15 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${15}` });
    expect(res15.statusCode).toBe(200);
    const data15 = JSON.parse(res15.payload) as IDidDocumentData;
    const doc15 = new DidDocument.DidDocument(data15);
    expect(data15.keys).toHaveLength(3);
    expect(data15.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data15.keys[1].auth.toString()).toStrictEqual(keyId2.toString());
    expect(data15.keys[2].auth.toString()).toStrictEqual(keyId3.toString());
    expect(data15.keys[0].valid).toBeTruthy();
    expect(data15.keys[1].valid).toBeTruthy();
    expect(data15.keys[2].valid).toBeTruthy();
    expect(doc15.height).toBe(15);
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 15)).toBeTruthy();
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 15)).toBeTruthy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 15)).toBeFalsy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.update, 15)).toBeFalsy();
  });

  it('can tombstone did', async() => {
    tombstoneDid(15, transactionId, defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));

    const res14 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${14}` });
    expect(res14.statusCode).toBe(200);
    const data14 = JSON.parse(res14.payload) as IDidDocumentData;
    const doc14 = new DidDocument.DidDocument(data14);
    expect(data14.keys).toHaveLength(1);
    expect(data14.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data14.keys[0].valid).toBeTruthy();
    expect(doc14.isTombstonedAt(14)).toBeFalsy();
    expect(doc14.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 14)).toBeTruthy();
    expect(doc14.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 14)).toBeTruthy();
    expect(doc14.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 14)).toBeFalsy();
    expect(doc14.hasRightAt(keyId2, RightRegistry.systemRights.update, 14)).toBeFalsy();

    const res15 = await hapiServer.inject({ method: 'get', url: `/did/${defaultDid}/document/${15}` });
    expect(res15.statusCode).toBe(200);
    const data15 = JSON.parse(res15.payload) as IDidDocumentData;
    const doc15 = new DidDocument.DidDocument(data15);
    expect(data15.keys).toHaveLength(1);
    expect(data15.keys[0].auth.toString()).toStrictEqual(defaultKeyId.toString());
    expect(data15.keys[0].valid).toBeFalsy();
    expect(doc15.isTombstonedAt(15)).toBeTruthy();
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.impersonate, 15)).toBeFalsy();
    expect(doc15.hasRightAt(defaultKeyId, RightRegistry.systemRights.update, 15)).toBeFalsy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.impersonate, 15)).toBeFalsy();
    expect(doc15.hasRightAt(keyId2, RightRegistry.systemRights.update, 15)).toBeFalsy();
  });

  const getDidTransactions = async(includeAttempts: boolean, did: Did,
    fromHeight: number, untilHeight?: number): Promise<TransactionId[]> => {
    const endpoint = includeAttempts ? 'transaction-attempts' : 'transactions';
    let url = `/did/${did}/${endpoint}/${fromHeight}/`;

    if (untilHeight) {
      url = url + untilHeight;
    }
    const res = await hapiServer.inject({ method: 'get', url });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload) as TransactionId[];
    return data;
  };

  const getDidOperations = async(includeAttempts: boolean, did: Did,
    fromHeight: number, untilHeight?: number): Promise<IDidOperation[]> => {
    const endpoint = includeAttempts ? 'operation-attempts' : 'operations';
    let url = `/did/${did}/${endpoint}/${fromHeight}/`;

    if (untilHeight) {
      url = url + untilHeight;
    }
    const res = await hapiServer.inject({ method: 'get', url });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload) as IDidOperation[];
    return data;
  };

  it('can query valid operations for implicit Did Document', async() => {
    fixture.stateHandler.applyEmptyBlockToState({ blockHeight: 100, blockId: 'SomeBlockId' });
    const defaultDidData = await getDidOperations(false, defaultDid, blockHeight);
    expect(defaultDidData).toHaveLength(0);
  });

  const applyComplexTransactionSequence = (
  ): number => {
    const firstTxAttempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(defaultDid, null)
      .addKey(keyId2)
      .addRight(keyId2, RightRegistry.systemRights.impersonate)
      .addRight(keyId2, RightRegistry.systemRights.update)
      .sign(defaultKeyId)
      .getAttempts();
    const firstTransaction = {
      asset: { operationAttempts: firstTxAttempts },
      blockHeight: 100,
      blockId: 'firstBlockId',
      transactionId: 'firstTransactionId',
    };
    fixture.stateHandler.applyTransactionToState(firstTransaction);
    fixture.transactionRepo.pushTransaction(firstTransaction.transactionId, firstTransaction.asset);
    lastTxId = firstTransaction.transactionId;

    const secondTxAttempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(defaultDid, 'firstTransactionId')
      .revokeKey(defaultKeyId)
      .on(did2, null)
      .addKey(defaultKeyId)
      .sign(keyId2)
      .getAttempts();
    const secondTransaction = {
      asset: { operationAttempts: secondTxAttempts },
      blockHeight: 101,
      blockId: 'secondBlockId',
      transactionId: 'secondTransactionId',
    };
    fixture.stateHandler.applyTransactionToState(secondTransaction);
    fixture.transactionRepo.pushTransaction(secondTransaction.transactionId, secondTransaction.asset);
    lastTxId = secondTransaction.transactionId;

    const thirdTxAttempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(did2, 'secondTransactionId')
      .addKey(keyId3)
      .on(did3, null)
      .addKey(keyId2)
      .sign(keyId3)
      .getAttempts();
    const thirdTransaction = {
      asset: { operationAttempts: thirdTxAttempts },
      blockHeight: 102,
      blockId: 'thirdBlockId',
      transactionId: 'thirdTransactionId',
    };
    fixture.stateHandler.applyTransactionToState(thirdTransaction);
    fixture.transactionRepo.pushTransaction(thirdTransaction.transactionId, thirdTransaction.asset);
    lastTxId = thirdTransaction.transactionId;

    return 103;
  };

  const defaultDidExpectedOps = [
    {
      'transactionId': 'secondTransactionId',
      'blockHeight': 101,
      'data': {
        'operation': 'revokeKey',
        'did': 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr',
        'lastTxId': 'firstTransactionId',
        'auth': 'iezbeWGSY2dqcUBqT8K7R14xr',
      },
      'valid': true,
    },
    {
      'transactionId': 'firstTransactionId',
      'blockHeight': 100,
      'data': {
        'operation': 'addRight',
        'did': 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr',
        'lastTxId': null,
        'auth': 'iez25N5WZ1Q6TQpgpyYgiu9gTX',
        'right': 'update',
      },
      'valid': true,
    },
    {
      'transactionId': 'firstTransactionId',
      'blockHeight': 100,
      'data': {
        'operation': 'addRight',
        'did': 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr',
        'lastTxId': null,
        'auth': 'iez25N5WZ1Q6TQpgpyYgiu9gTX',
        'right': 'impersonate',
      },
      'valid': true,
    },
    {
      'transactionId': 'firstTransactionId',
      'blockHeight': 100,
      'data': {
        'operation': 'addKey',
        'did': 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr',
        'lastTxId': null,
        'auth': 'iez25N5WZ1Q6TQpgpyYgiu9gTX',
      },
      'valid': true,
    },
  ];

  it('can query multiple valid complex transactions', async() => {
    const endHeight = applyComplexTransactionSequence();

    const defaultDidData = await getDidTransactions(false, defaultDid, blockHeight, endHeight);
    expect(defaultDidData).toStrictEqual([
      { transactionId: 'secondTransactionId', height: 101 },
      { transactionId: 'firstTransactionId', height: 100 },
    ]);

    const did2Data = await getDidTransactions(false, did2, blockHeight, endHeight);
    expect(did2Data).toStrictEqual([{ transactionId: 'secondTransactionId', height: 101 }]);

    const did3Data = await getDidTransactions(false, did3, blockHeight, endHeight);
    expect(did3Data).toStrictEqual([]);
  });

  it('can query multiple valid complex operations', async() => {
    const endHeight = applyComplexTransactionSequence();

    const defaultDidData = await getDidOperations(false, defaultDid, blockHeight, endHeight);
    expect(defaultDidData).toStrictEqual(defaultDidExpectedOps);

    const did2Data = await getDidOperations(false, did2, blockHeight, endHeight);
    expect(did2Data).toStrictEqual([
      {
        'transactionId': 'secondTransactionId',
        'blockHeight': 101,
        'data': {
          'operation': 'addKey',
          'did': 'did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX',
          'lastTxId': null,
          'auth': 'iezbeWGSY2dqcUBqT8K7R14xr',
        },
        'valid': true,
      },
    ]);

    const did3Data = await getDidOperations(false, did3, blockHeight, endHeight);
    expect(did3Data).toStrictEqual([]);
  });

  it('can query all operation-attempts for implicit Did Document', async() => {
    fixture.stateHandler.applyEmptyBlockToState({ blockHeight: 100, blockId: 'SomeBlockId' });
    const defaultDidData = await getDidOperations(true, defaultDid, blockHeight);
    expect(defaultDidData).toHaveLength(0);
  });

  it('can query multiple complex transaction attempts, including both valid and invalid ones', async() => {
    const endHeight = applyComplexTransactionSequence();

    const defaultDidData = await getDidTransactions(true, defaultDid, blockHeight, endHeight);
    expect(defaultDidData).toStrictEqual([
      { transactionId: 'secondTransactionId', height: 101 },
      { transactionId: 'firstTransactionId', height: 100 },
    ]);

    const did2Data = await getDidTransactions(true, did2, blockHeight, endHeight);
    expect(did2Data).toStrictEqual([
      { transactionId: 'thirdTransactionId', height: 102 },
      { transactionId: 'secondTransactionId', height: 101 },
    ]);

    const did3Data = await getDidTransactions(true, did3, blockHeight, endHeight);
    expect(did3Data).toStrictEqual([{ transactionId: 'thirdTransactionId', height: 102 }]);
  });

  it('can query multiple complex operation attempts, including both valid and invalid ones', async() => {
    const endHeight = applyComplexTransactionSequence();

    const defaultDidData = await getDidOperations(true, defaultDid, blockHeight, endHeight);
    expect(defaultDidData).toStrictEqual(defaultDidExpectedOps);

    const did2Data = await getDidOperations(true, did2, blockHeight, endHeight);
    expect(did2Data).toStrictEqual([
      {
        'transactionId': 'thirdTransactionId',
        'blockHeight': 102,
        'data': {
          'operation': 'addKey',
          'did': 'did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX',
          'lastTxId': 'secondTransactionId',
          'auth': 'iezkXs7Xd8SDWLaGKUAjEf53W',
        },
        'valid': false,
      },
      {
        'transactionId': 'secondTransactionId',
        'blockHeight': 101,
        'data': {
          'operation': 'addKey',
          'did': 'did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX',
          'lastTxId': null,
          'auth': 'iezbeWGSY2dqcUBqT8K7R14xr',
        },
        'valid': true,
      },
    ]);

    const did3Data = await getDidOperations(true, did3, blockHeight, endHeight);
    expect(did3Data).toStrictEqual([
      {
        'transactionId': 'thirdTransactionId',
        'blockHeight': 102,
        'data': {
          'operation': 'addKey',
          'did': 'did:morpheus:ezkXs7Xd8SDWLaGKUAjEf53W',
          'lastTxId': null,
          'auth': 'iez25N5WZ1Q6TQpgpyYgiu9gTX',
        },
        'valid': false,
      },
    ]);
  });

  it('can check transaction validity', async() => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(defaultDid, null)
      .addRight(keyId2, RightRegistry.systemRights.update) // key is not yet added
      .sign(defaultKeyId)
      .getAttempts();
    const res = await hapiServer.inject({ method: 'post', url: `/check-transaction-validity`, payload: attempts });
    const errors = JSON.parse(res.payload) as Interfaces.IDryRunOperationError[];
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(`DID ${defaultDid} has no valid key matching ${keyId2} at height 0`);
    expect(errors[0].invalidOperationAttempt).toStrictEqual(attempts[0]);
  });

  it('transaction status gives 404 for tx not seen by morpheus', async() => {
    const txid = 'c18894aa5ffe6f819dc98770d1eb9c4357c4d1ef73221fd5937cc360a54dd77f';
    expect(fixture.stateHandler.query.isConfirmed(txid)).toStrictEqual(Optional.empty());
    const res = await hapiServer.inject({ method: 'get', url: `/txn-status/${txid}` });
    expect(res.statusCode).toBe(404);
    expect(res.payload).toMatch(txid);
    expect(res.payload).toMatch('not processed');
  });

  it('confirmed transaction status gives true', async() => {
    addKey(keyId2, 10, transactionId, defaultKeyId);
    expect(fixture.stateHandler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));

    const res = await hapiServer.inject({ method: 'get', url: `/txn-status/${transactionId}` });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('true');
  });

  it('rejected transaction status gives false', async() => {
    addRight(keyId2, 10, transactionId, defaultKeyId); // key not added yet
    expect(fixture.stateHandler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));

    const res = await hapiServer.inject({ method: 'get', url: `/txn-status/${transactionId}` });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('false');
  });
});

describe('safePathInt', () => {
  it('handles undefined', () => {
    expect(safePathInt(undefined)).toBe(undefined);
  });

  it('handles empty string', () => {
    expect(safePathInt('')).toBe(undefined);
  });

  it('handles int as string', () => {
    expect(safePathInt('5')).toBe(5);
  });

  it('handles float as string', () => {
    expect(safePathInt('4.2')).toBe(4);
  });

  it('handles number with string concatenated', () => {
    expect(safePathInt('99balloons')).toBe(undefined);
    expect(safePathInt('balloons99')).toBe(undefined);
  });

  it('handles string', () => {
    expect(safePathInt('nowayitsanumber')).toBe(undefined);
  });

  it('handles null', () => {
    expect(safePathInt(null)).toBe(undefined);
  });

  it('handles string undefined', () => {
    expect(safePathInt('undefined')).toBe(undefined);
  });

  it('handles string null', () => {
    expect(safePathInt('null')).toBe(undefined);
  });

  it('handles empty array', () => {
    expect(safePathInt('[]')).toBe(undefined);
  });

  it('handles object', () => {
    expect(safePathInt('{}')).toBe(undefined);
  });
});
