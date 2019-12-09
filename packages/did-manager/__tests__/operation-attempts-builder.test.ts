import { Interfaces, SignedMessage } from '@internet-of-people/keyvault';
import { IAddKeyData, IRegisterBeforeProofData, ISignableOperationData, ISignedOperationsData, OperationType, SignableOperationType } from '../src/interfaces';
import { OperationAttemptsBuilder } from '../src/morpheus-transaction/operations';

describe('OperationAttemptsBuilder', () => {
  let builder: OperationAttemptsBuilder;
  beforeEach(() => {
    builder = new OperationAttemptsBuilder();
  });

  it('can create IBeforeProofData without vault or signing', () => {
    const contentId = 'contentId';
    const attempts = builder.registerBeforeProof(contentId).getAttempts();
    const expectedBeforeProofData: IRegisterBeforeProofData = {
      operation: OperationType.RegisterBeforeProof,
      contentId
    };
    expect(attempts).toStrictEqual([expectedBeforeProofData]);
  });

  it('can sign an addKey with a vault', () => {
    const signMock = jest.fn<SignedMessage, [Uint8Array, string]>();
    const vault: Interfaces.IVault = {
      sign: signMock,
      validateSignature: jest.fn<boolean, [SignedMessage, string | undefined]>(),
    };
    const expectedAddKeyData: IAddKeyData = {
      operation: SignableOperationType.AddKey,
      did: 'did:morpheus:ezFoo',
      auth: 'iezBar',
      expiresAtHeight: 69,
    };
    const expectedOperationData: ISignedOperationsData = {
      operation: OperationType.Signed,
      signables: [
        expectedAddKeyData
      ],
      signerDid: 'did:morpheus:ezFoo',
      signerPublicKey: 'pezFoo',
      signature: 'sezBaz',
    };
    signMock.mockImplementationOnce((msg, _) => new SignedMessage(expectedOperationData.signerPublicKey, msg, expectedOperationData.signature));
    const attempts = builder
      .withVault(vault)
        .addKey(expectedAddKeyData.did, expectedAddKeyData.auth, expectedAddKeyData.expiresAtHeight)
        .sign(expectedAddKeyData.did)
      .getAttempts();
    expect(attempts).toStrictEqual([expectedOperationData]);
  });
});