import { IVault, KeyId, PublicKey, Signature, SignedBytes } from '@internet-of-people/morpheus-core';
import { IO } from '@internet-of-people/sdk';
type TransactionId = IO.TransactionId;

import {
  IAddKeyData,
  IRegisterBeforeProofData,
  ISignedOperationsData,
  OperationType,
  SignableOperationType,
} from '../src/interfaces';
import { OperationAttemptsBuilder } from '../src/morpheus-transaction/operations';
import { assertStringlyEqual } from './utils';

const assertSignedOperationsEqual = (actual: ISignedOperationsData, expected: ISignedOperationsData): void => {
  assertStringlyEqual(actual.signerPublicKey, expected.signerPublicKey);
  assertStringlyEqual(actual.signature, expected.signature);
  expect(actual.operation).toBe(expected.operation);
  expect(actual.signables).toHaveLength(expected.signables.length);

  for (let i = 0; i < actual.signables.length; i += 1) {
    // TODO signed operations might need toString on some of their fields, so we might need a visitor
    expect(actual.signables[i]).toStrictEqual(expected.signables[i]);
  }
};

describe('OperationAttemptsBuilder', () => {
  const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
  const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
  const keyId1 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');

  const lastTxId: TransactionId | null = null;

  let builder: OperationAttemptsBuilder;
  beforeEach(() => {
    builder = new OperationAttemptsBuilder();
  });

  it('can create IBeforeProofData without vault or signing', () => {
    const contentId = 'contentId';
    const attempts = builder.registerBeforeProof(contentId).getAttempts();
    const expectedBeforeProofData: IRegisterBeforeProofData = {
      operation: OperationType.RegisterBeforeProof,
      contentId,
    };
    expect(attempts).toStrictEqual([expectedBeforeProofData]);
  });

  it('can sign an addKey with a vault', () => {
    const signMock = jest.fn<SignedBytes, [KeyId, Uint8Array]>();
    const vault: IVault = {
      signDidOperations: signMock,
    };
    const expectedAddKeyData: IAddKeyData = {
      operation: SignableOperationType.AddKey,
      did,
      lastTxId,
      auth: keyId1.toString(),
      expiresAtHeight: 69,
    };
    const expectedOperationData: ISignedOperationsData = {
      operation: OperationType.Signed,
      signables: [
        expectedAddKeyData,
      ],
      signerPublicKey: 'pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6',
      signature: 'sez6JdkXYwnz9VD5KECBq7B5jBiWBZiqf1Pzh6D9Rzf9QhmqDXsAvNPhzNGe7TkM3BD2uV6Y2w9MgAsVf2wGwARpNW4',
    };
    signMock.mockImplementationOnce((_, msg) => {
      return new SignedBytes(
        new PublicKey(expectedOperationData.signerPublicKey),
        msg,
        new Signature(expectedOperationData.signature),
      );
    });
    const attempts = builder
      .withVault(vault)
      .on(did, lastTxId)
      .addKey(keyId1, expectedAddKeyData.expiresAtHeight)
      .sign(defaultKeyId)
      .getAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].operation).toBe(expectedOperationData.operation);
    assertSignedOperationsEqual(attempts[0] as ISignedOperationsData, expectedOperationData);
  });
});
