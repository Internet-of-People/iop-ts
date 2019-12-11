import { Interfaces, MorpheusTransaction } from '@internet-of-people/did-manager';
import { Interfaces as KvInterfaces, KeyId, PersistentVault, Signature, SignedMessage, Vault } from '@internet-of-people/keyvault';
import { EventEmitter } from 'events';
import Optional from 'optional-js';
import { MorpheusStateHandler } from '../src/state-handler';

const { Operations: { OperationAttemptsBuilder } } = MorpheusTransaction;

export const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
export const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
export const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');

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
    sign: (message: Uint8Array, keyId: KeyId): SignedMessage => rustVault.sign(keyId, message)
  };

  let handler: MorpheusStateHandler;
  beforeEach(() => {
    handler = new MorpheusStateHandler({
      appName: 'state-handler-tests',
      debug: jest.fn<void, [any]>(),
      info: jest.fn<void, [any]>(),
      warn: jest.fn<void, [any]>(),
      error: jest.fn<void, [any]>(),
    }, new EventEmitter());
  });

  const contentId = 'myFavoriteContentId';
  const transactionId = 'myFavoriteTxid';
  const blockId = 'myFavoriteBlockId';
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
    expect(handler.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query.beforeProofExistsAt(contentId, 3)).toBeFalsy();
    expect(handler.query.beforeProofExistsAt(contentId, 7)).toBeTruthy();
  });

  const otherContentId = 'someOtherContentId';

  it('rejects before proof with already registered content id', () => {
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
    expect(handler.query.beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query.beforeProofExistsAt(otherContentId, 7)).toBeFalsy();
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
      asset: {operationAttempts:[]},
      blockHeight: -1,
      blockId: 'invalid',
      transactionId: 'invalid'
    });

    expect(() =>handler.query).toThrowError();
  });

  it('authentication passes on signed operation', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .sign(defaultKeyId)
      .getAttempts();
    expect(attempts[0].operation).toBe(Interfaces.OperationType.Signed);
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
    const signed = attempts[0] as Interfaces.ISignedOperationsData;
    const invalidSignature = 'Sez6JdkXYwnz9VD5KECBq7B5jBiWBZiqf1Pzh6D9Rzf9QhmqDXsAvNPhzNGe7TkM3BD2uV6Y2w9MgAsVf2wGwARpNW4';
    signed.signature = new Signature(invalidSignature);
    handler.applyTransactionToState({
      asset: { operationAttempts: attempts },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(false));
  });

  it('default key can add new key', () => {
    const attempts = new OperationAttemptsBuilder()
      .withVault(vault)
      .addKey(did, keyId1)
      .sign(defaultKeyId)
      .getAttempts();
    handler.applyTransactionToState({
      asset: { operationAttempts: attempts },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query.isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    assertStringlyEqual(handler.query.getDidDocumentAt(did, 5).toData().keys[1].auth, keyId1);
  });
});
