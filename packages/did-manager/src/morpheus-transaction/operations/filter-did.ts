import {
  Authentication,
  Did,
  IOperationVisitor,
  ISignableOperationVisitor, ISignedOperationsData,
  Right,
  SignableOperation,
  TransactionId,
} from '../../interfaces';
import { Signed } from './signed';

const visitorSignableFilterDid = (expectedDid: Did): ISignableOperationVisitor<boolean> => {
  return {
    addKey: (
      did: Did,
      _lastTxId: TransactionId | null,
      _newAuth: Authentication,
      _expiresAtHeight?: number,
    ): boolean => {
      return expectedDid === did;
    },
    revokeKey: (
      did: Did,
      _lastTxId: TransactionId | null,
      _auth: Authentication,
    ): boolean => {
      return expectedDid === did;
    },
    addRight: (
      did: Did,
      _lastTxId: TransactionId | null,
      _auth: Authentication,
      _right: Right,
    ): boolean => {
      return expectedDid === did;
    },
    revokeRight: (
      did: Did,
      _lastTxId: TransactionId | null,
      _auth: Authentication,
      _right: Right,
    ): boolean => {
      return expectedDid === did;
    },
    tombstoneDid: (
      did: Did,
      _lastTxId: TransactionId | null,
    ): boolean => {
      return expectedDid === did;
    },
  };
};

export const visitorFilterDid = (expectedDid: Did): IOperationVisitor<SignableOperation[]> => {
  return {
    signed: (operations: ISignedOperationsData): SignableOperation[] => {
      const signableOperations = Signed.getOperationsUnsafeWithoutSignatureChecking(operations);
      const visitor = visitorSignableFilterDid(expectedDid);
      return signableOperations.filter((op) => {
        return op.accept(visitor);
      });
    },
    registerBeforeProof: (_contentId: string): SignableOperation[] => {
      return [];
    },
  };
};
