import { Authentication, ISignedOperationsData, IStateChange, OperationType, TransactionId } from '../src/interfaces';
import {
  Interfaces as KvInterfaces,
  KeyId,
  PersistentVault,
  SignedMessage,
  Vault,
} from '@internet-of-people/keyvault';
import { EventEmitter } from 'events';
import Optional from 'optional-js';
import { MorpheusStateHandler } from '../src/morpheus-transaction/state-handler';
import { Operations } from '../src/morpheus-transaction';

export const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
export const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
export const keyId1 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
export const keyId2 = new KeyId('iezkXs7Xd8SDWLaGKUAjEf53W');

const { DidDocument: { RightRegistry }, OperationAttemptsBuilder } = Operations;

export interface IToString {
  toString(): string;
}

export const assertStringlyEqual = (actual: IToString, expected: IToString): void => {
  expect(actual.toString()).toStrictEqual(expected.toString());
};

describe('StateHandler', () => {
  const rustVault = new Vault(PersistentVault.DEMO_PHRASE);
  rustVault.createId();
  rustVault.createId();
  rustVault.createId();

  const vault: KvInterfaces.IVault = {
    sign: (message: Uint8Array, keyId: KeyId): SignedMessage => {
      return rustVault.sign(keyId, message);
    },
  };

  let handler: MorpheusStateHandler;
  const contentId = 'myFavoriteContentId';
  const otherContentId = 'someOtherContentId';
  const transactionId = 'myFavoriteTxid';
  const blockId = 'myFavoriteBlockId';
  let lastTxId: TransactionId | null;

  const addKey = (
    blockHeight: number,
    keyToAdd: Authentication,
    signWith: Authentication,
    txId: string,
  ): IStateChange => {
    const stateChange = {
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(did, lastTxId)
        .addKey(keyToAdd)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    };
    handler.applyTransactionToState(stateChange);
    return stateChange;
  };

  const revokeKey = (
    blockHeight: number,
    keyToRevoke: Authentication,
    signWith: Authentication,
    txId: string,
  ): IStateChange => {
    const stateChange = {
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(did, lastTxId)
        .revokeKey(keyToRevoke)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    };
    handler.applyTransactionToState(stateChange);
    return stateChange;
  };

  const addRight = (
    blockHeight: number,
    toKey: Authentication,
    signWith: Authentication,
    txId: string,
  ): IStateChange => {
    const stateChange = {
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(did, lastTxId)
        .addRight(toKey, RightRegistry.systemRights.update)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    };
    handler.applyTransactionToState(stateChange);
    return stateChange;
  };

  const revokeRight = (
    blockHeight: number,
    toKey: Authentication,
    signWith: Authentication,
    txId: string,
  ): IStateChange => {
    const stateChange = {
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .on(did, lastTxId)
        .revokeRight(toKey, RightRegistry.systemRights.update)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    };
    handler.applyTransactionToState(stateChange);
    return stateChange;
  };

  const tombstoneDid = (blockHeight: number, txId: string): IStateChange => {
    const stateChange = {
      asset: {
        operationAttempts: new OperationAttemptsBuilder()
          .withVault(vault)
          .on(did, lastTxId)
          .tombstoneDid()
          .sign(defaultKeyId)
          .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    };
    handler.applyTransactionToState(stateChange);
    return stateChange;
  };

  beforeEach(() => {
    handler = new MorpheusStateHandler({
      appName: 'state-handler-tests',
      debug: jest.fn<void, [string]>(),
      info: jest.fn<void, [string]>(),
      warn: jest.fn<void, [string]>(),
      error: jest.fn<void, [string]>(),
    }, new EventEmitter());
    lastTxId = null;
  });

  const registrationAttempt = new OperationAttemptsBuilder()
    .registerBeforeProof(contentId)
    .getAttempts();

  it('applies valid state change', () => {
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    expect(handler.query.beforeProofExistsAt(contentId, 5)).toBeTruthy();
    /* eslint no-undefined: 0 */
    expect(handler.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query.beforeProofExistsAt(contentId, 3)).toBeFalsy();
    expect(handler.query.beforeProofExistsAt(contentId, 7)).toBeTruthy();
  });

  it('rejects before proof with already registered content id in an atomic way', () => {
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.empty());
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    expect(handler.query.beforeProofExistsAt(contentId, 5)).toBeTruthy();
    expect(handler.query.beforeProofExistsAt(otherContentId, 7)).toBeFalsy();
    /* eslint no-undefined: 0 */
    expect(handler.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();

    const otherTxId = 'someOtherTransactionId';
    const multipleRegistrationAttempts = new OperationAttemptsBuilder()
      .registerBeforeProof(otherContentId)
      .registerBeforeProof(contentId)
      .getAttempts();
    handler.applyTransactionToState({
      asset: { operationAttempts: multipleRegistrationAttempts },
      blockHeight: 7,
      blockId,
      transactionId: otherTxId,
    });

    // TODO: change the api to be able to know what was the rejection reason
    expect(handler.query.isConfirmed(otherTxId)).toStrictEqual(Optional.of(false));
    expect(handler.query.beforeProofExistsAt(contentId, 7)).toBeTruthy();
    /* eslint no-undefined: 0 */
    expect(handler.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query.beforeProofExistsAt(otherContentId, 7)).toBeFalsy();
    /* eslint no-undefined: 0 */
    expect(handler.query.beforeProofExistsAt(otherContentId, undefined)).toBeFalsy();
  });

  it('corrupted state cannot be queried', () => {
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));

    handler.revertTransactionFromState({
      asset: { operationAttempts: [] },
      blockHeight: -1,
      blockId: 'invalid',
      transactionId: 'invalid',
    });

    expect(() => {
      return handler.query;
    }).toThrowError();
  });

  it('authentication passes on signed operation', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, null)
      .sign(defaultKeyId)
      .getAttempts();
    expect(attempts[0].operation).toBe(OperationType.Signed);
    handler.applyTransactionToState({
      asset: { operationAttempts: attempts },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
  });

  it('authentication fails on invalid signature', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, null)
      .sign(defaultKeyId)
      .getAttempts();
    const signed = attempts[0] as ISignedOperationsData;
    /* eslint max-len: 0 */
    const invalidSignature = 'sez6JdkXYwnz9VD5KECBq7B5jBiWBZiqf1Pzh6D9Rzf9QhmqDXsAvNPhzNGe7TkM3BD2uV6Y2w9MgAsVf2wGwARpNW4';
    signed.signature = invalidSignature;
    handler.applyTransactionToState({
      asset: { operationAttempts: attempts },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));
  });

  it('default key can add new key', () => {
    addKey(5, keyId1, defaultKeyId, transactionId);
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    assertStringlyEqual(handler.query.getDidDocumentAt(did, 5).toData().keys[1].auth, keyId1);
  });

  it('rights can be moved to a different key in a single transaction', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, null)
      .addKey(keyId1)
      .addRight(keyId1, RightRegistry.systemRights.impersonate)
      .addRight(keyId1, RightRegistry.systemRights.update)
      .sign(defaultKeyId)
      .withVault(vault)
      .on(did, null)
      .revokeKey(defaultKeyId)
      .sign(keyId1)
      .getAttempts();
    handler.applyTransactionToState({
      asset: { operationAttempts: attempts },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
  });

  it('can revoke keys', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    const doc5 = handler.query.getDidDocumentAt(did, 5).toData();
    expect(doc5.keys).toHaveLength(2);
    assertStringlyEqual(doc5.keys[0].auth, defaultKeyId);
    assertStringlyEqual(doc5.keys[1].auth, keyId1);
    expect(doc5.keys[0].valid).toBeTruthy();
    expect(doc5.keys[1].valid).toBeTruthy();

    revokeKey(10, keyId1, defaultKeyId, 'tx2');

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    const doc10 = handler.query.getDidDocumentAt(did, 10).toData();
    expect(doc10.keys).toHaveLength(2);
    assertStringlyEqual(doc10.keys[0].auth, defaultKeyId);
    assertStringlyEqual(doc10.keys[1].auth, keyId1);
    expect(doc10.keys[0].valid).toBeTruthy();
    expect(doc10.keys[1].valid).toBeFalsy();
  });

  it('cannot revoke not existing key', () => {
    revokeKey(10, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(false));
  });

  it('can revoke key if has right to update', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addRight(6, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';

    revokeKey(10, defaultKeyId, keyId1, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    const doc10 = handler.query.getDidDocumentAt(did, 10).toData();
    expect(doc10.keys).toHaveLength(2);
    assertStringlyEqual(doc10.keys[0].auth, defaultKeyId);
    assertStringlyEqual(doc10.keys[1].auth, keyId1);
    expect(doc10.keys[0].valid).toBeFalsy();
    expect(doc10.keys[1].valid).toBeTruthy();
  });

  it('cannot revoke key if has no right to update', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';

    revokeKey(10, defaultKeyId, keyId1, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
    const doc10 = handler.query.getDidDocumentAt(did, 10).toData();
    expect(doc10.keys).toHaveLength(2);
    assertStringlyEqual(doc10.keys[0].auth, defaultKeyId);
    assertStringlyEqual(doc10.keys[1].auth, keyId1);
    expect(doc10.keys[0].valid).toBeTruthy();
    expect(doc10.keys[1].valid).toBeTruthy();
  });

  it('adding keys can be reverted', () => {
    const stateChange = addKey(5, keyId1, defaultKeyId, transactionId);
    expect(handler.query.getDidDocumentAt(did, 5).toData().keys).toHaveLength(2);

    handler.revertTransactionFromState(stateChange);

    expect(handler.query.getDidDocumentAt(did, 5).toData().keys).toHaveLength(1);
  });

  it('revoking keys can be reverted', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    const stateChange = revokeKey(10, keyId1, defaultKeyId, 'tx2');
    const data10 = handler.query.getDidDocumentAt(did, 10).toData();
    expect(data10.keys[0].valid).toBeTruthy();
    expect(data10.keys[1].valid).toBeFalsy();

    handler.revertTransactionFromState(stateChange);

    const doc10AfterRevert = handler.query.getDidDocumentAt(did, 10).toData();
    expect(doc10AfterRevert.keys[0].valid).toBeTruthy();
    expect(doc10AfterRevert.keys[1].valid).toBeTruthy();
  });

  it('can add rights', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    const doc5 = handler.query.getDidDocumentAt(did, 5);
    expect(doc5.hasRightAt(keyId1, RightRegistry.systemRights.update, 5)).toBeFalsy();

    addRight(10, keyId1, defaultKeyId, 'tx2');

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    const doc10 = handler.query.getDidDocumentAt(did, 10);
    expect(doc10.hasRightAt(keyId1, RightRegistry.systemRights.update, 5)).toBeFalsy();
    expect(doc10.hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeTruthy();
  });

  it('cannot add right to a key that has not been added', () => {
    addRight(5, keyId1, defaultKeyId, transactionId);
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 5).hasRightAt(keyId1, RightRegistry.systemRights.update, 5)).toBeFalsy();
  });

  it('cannot add right with the same auth', () => {
    addRight(5, defaultKeyId, defaultKeyId, transactionId);
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));
  });

  it('can revoke rights', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    expect(handler.query.getDidDocumentAt(did, 5).hasRightAt(keyId1, RightRegistry.systemRights.update, 5)).toBeFalsy();

    addRight(5, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';
    expect(handler.query.getDidDocumentAt(did, 5).hasRightAt(keyId1, RightRegistry.systemRights.update, 5)).toBeTruthy();

    revokeRight(15, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));

    const doc14 = handler.query.getDidDocumentAt(did, 14);
    expect(doc14.hasRightAt(keyId1, RightRegistry.systemRights.update, 14)).toBeTruthy();
    expect(
      () => {
        return doc14.hasRightAt(keyId1, RightRegistry.systemRights.update, 15);
      },
    ).toThrowError('Cannot query at 15, latest block seen was 14');
    const doc15 = handler.query.getDidDocumentAt(did, 15);
    expect(doc15.hasRightAt(keyId1, RightRegistry.systemRights.update, 14)).toBeTruthy();
    expect(doc15.hasRightAt(keyId1, RightRegistry.systemRights.update, 15)).toBeFalsy();
  });

  it('cannot revoke not applied right', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';

    revokeRight(10, keyId1, defaultKeyId, 'tx2');

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeFalsy();
  });

  it('cannot revoke applied right before it was applied', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeTruthy();

    revokeRight(9, keyId1, defaultKeyId, 'tx3');
    expect(() => {
      return handler.query.isConfirmed('tx3');
    }).toThrowError('Layer2 is corrupted.');
  });

  it('can revoke right if has right to update', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addKey(5, keyId2, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';
    addRight(10, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx3';
    addRight(10, keyId2, defaultKeyId, 'tx4');
    expect(handler.query.isConfirmed('tx4')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx4';
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeTruthy();

    revokeRight(15, keyId1, keyId2, 'tx5');

    expect(handler.query.isConfirmed('tx5')).toStrictEqual(Optional.of(true));
    const doc15 = handler.query.getDidDocumentAt(did, 15);
    expect(doc15.hasRightAt(keyId1, RightRegistry.systemRights.update, 14)).toBeTruthy();
    expect(doc15.hasRightAt(keyId1, RightRegistry.systemRights.update, 15)).toBeFalsy();
  });

  it('cannot revoke right if has no right to update', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addKey(5, keyId2, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';
    addRight(10, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx3';
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeTruthy();

    revokeRight(15, keyId1, keyId2, 'tx4');

    expect(handler.query.isConfirmed('tx4')).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 15).hasRightAt(keyId1, RightRegistry.systemRights.update, 15)).toBeTruthy();
  });

  it('cannot revoke right with the same auth', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';

    revokeRight(15, keyId1, keyId1, 'tx3');

    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 15).hasRightAt(keyId1, RightRegistry.systemRights.update, 15)).toBeTruthy();
  });

  it('adding rights can be reverted', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    const stateChange = addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeTruthy();

    handler.revertTransactionFromState(stateChange);

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.empty());
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeFalsy();
  });

  it('revoking rights can be reverted', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';
    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx2';
    expect(handler.query.getDidDocumentAt(did, 10).hasRightAt(keyId1, RightRegistry.systemRights.update, 10)).toBeTruthy();
    const stateChange = revokeRight(15, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 15).hasRightAt(keyId1, RightRegistry.systemRights.update, 15)).toBeFalsy();

    handler.revertTransactionFromState(stateChange);

    expect(handler.query.getDidDocumentAt(did, 15).hasRightAt(keyId1, RightRegistry.systemRights.update, 15)).toBeTruthy();
  });

  it('did can be tombstoned', () => {
    tombstoneDid(15, transactionId);

    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    const doc15 = handler.query.getDidDocumentAt(did, 15);
    expect(doc15.isTombstonedAt(14)).toBeFalsy();
    expect(doc15.isTombstonedAt(15)).toBeTruthy();
  });

  it('tombstoned did can be reverted', () => {
    const stateChange = tombstoneDid(15, transactionId);
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 15).isTombstonedAt(15)).toBeTruthy();

    handler.revertTransactionFromState(stateChange);

    expect(handler.query.getDidDocumentAt(did, 15).isTombstonedAt(15)).toBeFalsy();
  });

  it('tombstoned did cannot be updated', () => {
    tombstoneDid(15, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    lastTxId = 'tx1';

    addKey(16, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));

    revokeKey(17, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(false));

    addRight(18, keyId1, defaultKeyId, 'tx4');
    expect(handler.query.isConfirmed('tx4')).toStrictEqual(Optional.of(false));

    revokeRight(19, keyId1, defaultKeyId, 'tx5');
    expect(handler.query.isConfirmed('tx5')).toStrictEqual(Optional.of(false));

    tombstoneDid(20, 'tx6');
    expect(handler.query.isConfirmed('tx6')).toStrictEqual(Optional.of(false));
  });

  it('cannot apply operation on implicit document with lastTxId set', () => {
    lastTxId = 'tx1';
    addKey(5, keyId2, defaultKeyId, 'tx2');

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
  });

  it('cannot apply operation on a non-implicit document with lastTxId unset', () => {
    addKey(5, keyId2, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));

    lastTxId = null;
    addRight(10, keyId2, defaultKeyId, 'tx2');

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
  });

  it('cannot apply operation on a non-implicit document with an invalid lastTxId', () => {
    addKey(5, keyId2, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));

    lastTxId = 'notTx1';
    addRight(10, keyId2, defaultKeyId, 'tx2');

    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
  });

  it('dry run runs for valid transaction', () => {
    // we have to emit at least one layer-1 tx to bump the internal lastSeenBlockHeight
    addKey(5, keyId2, defaultKeyId, transactionId);

    const errors = handler.dryRun(new OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, transactionId)
      .addKey(keyId1)
      .sign(defaultKeyId)
      .getAttempts(),
    );

    expect(errors).toHaveLength(0);
  });

  it('dry run returns the same error that we will receive', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .on(did, null)
      .addRight(keyId1, RightRegistry.systemRights.update) // key is not yet added
      .sign(defaultKeyId)
      .getAttempts();

    const errors = handler.dryRun(attempts);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(`DID ${did} has no valid key matching ${keyId1} at height 0`);
    expect(errors[0].invalidOperationAttempt).toStrictEqual(attempts[0]);
  });
});
