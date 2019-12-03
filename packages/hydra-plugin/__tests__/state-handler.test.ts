import Optional from "optional-js";
import { MorpheusTransaction } from "@internet-of-people/did-manager";
import { MorpheusStateHandler } from "../src/state-handler";

const { Operations: { OperationAttemptsBuilder } } = MorpheusTransaction;

describe('StateHandler singleton', () => {
  it('returns an instance', () => {
    expect(MorpheusStateHandler.instance()).toBeInstanceOf(MorpheusStateHandler);
  });

  it('returns the same instance twice', () => {
    const instance = MorpheusStateHandler.instance();
    expect(MorpheusStateHandler.instance()).toBe(instance);
  });
});

describe('StateHandler', () => {
  beforeEach(() => {
    MorpheusStateHandler.reset();
    MorpheusStateHandler.instance().logger = {
      appName: "state-handler-tests",
      debug: jest.fn<void, [any]>(),
      info: jest.fn<void, [any]>(),
      warn: jest.fn<void, [any]>(),
      error: jest.fn<void, [any]>(),
    };
  });

  const contentId = 'myFavoriteContentId';
  const transactionId = 'myFavoriteTxid';
  const blockId = 'myFavoriteBlockId';
  const registrationAttempt = new OperationAttemptsBuilder()
    .registerBeforeProof(contentId)
    .getAttempts();

  it('applies valid state change', () => {
    const handler = MorpheusStateHandler.instance();
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query().isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    expect(handler.query().beforeProofExistsAt(contentId, 5)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(contentId, 3)).toBeFalsy();
    expect(handler.query().beforeProofExistsAt(contentId, 7)).toBeTruthy();
  });

  const otherContentId = 'someOtherContentId';

  it('rejects before proof with already registered content id', () => {
    const handler = MorpheusStateHandler.instance();
    expect(handler.query().isConfirmed(transactionId)).toStrictEqual(Optional.empty());
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query().isConfirmed(transactionId)).toStrictEqual(Optional.of(true));
    expect(handler.query().beforeProofExistsAt(contentId, 5)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(otherContentId, 7)).toBeFalsy();
    expect(handler.query().beforeProofExistsAt(contentId, undefined)).toBeTruthy();

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
    expect(handler.query().isConfirmed(otherTxId)).toStrictEqual(Optional.of(false));
    expect(handler.query().beforeProofExistsAt(contentId, 7)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(otherContentId, 7)).toBeFalsy();
    expect(handler.query().beforeProofExistsAt(otherContentId, undefined)).toBeFalsy();
  });

  // TODO: test corrupt state
});
