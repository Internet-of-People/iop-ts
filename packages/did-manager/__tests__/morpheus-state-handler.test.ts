import { ISignedOperationsData, OperationType, Right, Authentication } from '../src/interfaces';
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
import { OperationAttemptsBuilder } from '../src/morpheus-transaction/operations';

export const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
export const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
export const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');
export const keyId2 = new KeyId('IezkXs7Xd8SDWLaGKUAjEf53W');

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

  const addKey = (
    blockHeight: number,
    toKey: Authentication,
    signWith: Authentication,
    txId: string,
  ): void => {
    handler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .addKey(did, toKey)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    });
  };

  const addRight = (
    blockHeight: number,
    toKey: Authentication,
    signWith: Authentication,
    txId: string,
  ): void => {
    handler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .addRight(did, toKey, Right.Update)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    });
  };

  // TODO: @bartmoss
  const revokeRight = (
    blockHeight: number,
    toKey: Authentication,
    signWith: Authentication,
    txId: string,
  ): void => {
    handler.applyTransactionToState({
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        // .revokeRight(did, toKey, Right.Update)
        .sign(signWith)
        .getAttempts(),
      }, blockHeight, blockId, transactionId: txId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
  };

  beforeEach(() => {
    handler = new MorpheusStateHandler({
      appName: 'state-handler-tests',
      debug: jest.fn<void, [string]>(),
      info: jest.fn<void, [string]>(),
      warn: jest.fn<void, [string]>(),
      error: jest.fn<void, [string]>(),
    }, new EventEmitter());
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
      .sign(defaultKeyId)
      .getAttempts();
    const signed = attempts[0] as ISignedOperationsData;
    /* eslint max-len: 0 */
    const invalidSignature = 'Sez6JdkXYwnz9VD5KECBq7B5jBiWBZiqf1Pzh6D9Rzf9QhmqDXsAvNPhzNGe7TkM3BD2uV6Y2w9MgAsVf2wGwARpNW4';
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

  // TODO: @bartmoss
  it.skip('rights can be moved to a different key in a single transaction', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .addKey(did, keyId1)
      .addRight(did, keyId1, Right.Impersonate)
      .addRight(did, keyId1, Right.Update)
      .sign(defaultKeyId)
      .withVault(vault)
    // .removeKey(did, defaultKeyId)
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

  // TODO: @bartmoss
  it.todo('can revoke keys');

  it('adding keys can be reverted', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .addKey(did, keyId1)
      .sign(defaultKeyId)
      .getAttempts();
    const stateChange = { asset: { operationAttempts: attempts }, blockHeight: 5, blockId, transactionId };
    handler.applyTransactionToState(stateChange);
    expect(handler.query.getDidDocumentAt(did, 5).toData().keys).toHaveLength(2);

    handler.revertTransactionFromState(stateChange);
    expect(handler.query.getDidDocumentAt(did, 5).toData().keys).toHaveLength(1);
  });

  // TODO: @bartmoss: also check skipped tests below.
  it.todo('revoking keys can be reverted');

  it('can add rights', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeFalsy();

    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();
  });

  it('cannot add right to a key that has not been added', () => {
    addRight(5, keyId1, defaultKeyId, transactionId);
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 5).hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it('cannot add right with the same auth', () => {
    addRight(5, defaultKeyId, defaultKeyId, transactionId);
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));
  });

  it.skip('can revoke rights', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeFalsy();

    addRight(5, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();

    revokeRight(15, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 14).hasRight(keyId1, Right.Update)).toBeTruthy();
    expect(handler.query.getDidDocumentAt(did, 15).hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it.skip('cannot revoke not applied right', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    revokeRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it.skip('cannot revoke applied right before it was applied', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();

    revokeRight(9, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();
  });

  it.skip('can revoke right if has right to update', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    addKey(5, keyId2, defaultKeyId, 'tx2');
    addRight(10, keyId1, defaultKeyId, 'tx3');
    addRight(10, keyId2, defaultKeyId, 'tx4');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx4')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();

    revokeRight(15, keyId1, keyId2, 'tx5');
    expect(handler.query.isConfirmed('tx5')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it.skip('cannot revoke right if has no right to update', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    addKey(5, keyId2, defaultKeyId, 'tx2');
    addRight(10, keyId1, defaultKeyId, 'tx3');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();

    revokeRight(15, keyId1, keyId2, 'tx4');
    expect(handler.query.isConfirmed('tx4')).toStrictEqual(Optional.of(false));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();
  });

  it.skip('cannot revoke right with the same auth', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));

    revokeRight(15, keyId1, keyId1, 'tx3');
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(false));
  });

  it('adding rights can be reverted', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));

    const stateChange = {
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        .addRight(did, keyId1, Right.Update)
        .sign(defaultKeyId)
        .getAttempts(),
      }, blockHeight: 10, blockId, transactionId: 'tx2',
    };

    handler.applyTransactionToState(stateChange);
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();

    handler.revertTransactionFromState(stateChange);
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it.skip('revoking rights can be reverted', () => {
    addKey(5, keyId1, defaultKeyId, 'tx1');
    addRight(10, keyId1, defaultKeyId, 'tx2');
    expect(handler.query.isConfirmed('tx1')).toStrictEqual(Optional.of(true));
    expect(handler.query.isConfirmed('tx2')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();

    const stateChange = {
      asset: { operationAttempts: new OperationAttemptsBuilder()
        .withVault(vault)
        // .revokeRight(did, keyId1, Right.Update) // TODO
        .sign(defaultKeyId)
        .getAttempts(),
      }, blockHeight: 10, blockId, transactionId: 'tx3',
    };

    handler.applyTransactionToState(stateChange);
    expect(handler.query.isConfirmed('tx3')).toStrictEqual(Optional.of(true));
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeFalsy();

    handler.revertTransactionFromState(stateChange);
    expect(handler.query.getDidDocumentAt(did, 10).hasRight(keyId1, Right.Update)).toBeTruthy();
  });
});
