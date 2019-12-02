import { MorpheusStateHandler } from "../src/state-handler";

import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import { IAppLog } from "../src/app-log";

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
    expect(handler.query().isConfirmed(transactionId)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(contentId, 5)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(contentId, undefined)).toBeTruthy();
    expect(handler.query().beforeProofExistsAt(contentId, 3)).toBeFalsy();
    expect(handler.query().beforeProofExistsAt(contentId, 7)).toBeTruthy();
  });

  it('rejects state change with old block height', () => {
    const handler = MorpheusStateHandler.instance();
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 5,
      blockId,
      transactionId,
    });
    expect(handler.query().isConfirmed(transactionId)).toBeTruthy();
    const newTransactionId = transactionId + 'x';
    handler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight: 3,
      blockId,
      transactionId: newTransactionId,
    });

  });
});