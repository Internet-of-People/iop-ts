import { Crypto, Layer1, Types } from '@internet-of-people/sdk';

const visitorSignableFilterDid = (
  expectedDidData: Types.Crypto.DidData,
): Types.Layer1.ISignableOperationVisitor<boolean> => {
  return {
    addKey: (
      did: Crypto.Did,
      _lastTxId: Types.Sdk.TransactionId | null,
      _newAuth: Types.Crypto.Authentication,
      _expiresAtHeight?: number,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    revokeKey: (
      did: Crypto.Did,
      _lastTxId: Types.Sdk.TransactionId | null,
      _auth: Types.Crypto.Authentication,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    addRight: (
      did: Crypto.Did,
      _lastTxId: Types.Sdk.TransactionId | null,
      _auth: Types.Crypto.Authentication,
      _right: Types.Sdk.Right,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    revokeRight: (
      did: Crypto.Did,
      _lastTxId: Types.Sdk.TransactionId | null,
      _auth: Types.Crypto.Authentication,
      _right: Types.Sdk.Right,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    tombstoneDid: (
      did: Crypto.Did,
      _lastTxId: Types.Sdk.TransactionId | null,
    ): boolean => {
      return expectedDidData === did.toString();
    },
  };
};

export const visitorFilterDid = (
  expectedDidData: Types.Crypto.DidData,
): Types.Layer1.IOperationVisitor<Layer1.SignableOperation[]> => {
  return {
    signed: (operations: Types.Layer1.ISignedOperationsData): Layer1.SignableOperation[] => {
      const signableOperations = Layer1.Signed.getOperationsUnsafeWithoutSignatureChecking(operations);
      const visitor = visitorSignableFilterDid(expectedDidData);
      return signableOperations.filter((op) => {
        return op.accept(visitor);
      });
    },
    registerBeforeProof: (_contentId: string): Layer1.SignableOperation[] => {
      return [];
    },
  };
};
