import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type DidData = IO.DidData;
type Right = IO.Right;
type TransactionId = IO.TransactionId;

import {
  IOperationVisitor,
  ISignableOperationVisitor, ISignedOperationsData,
  SignableOperation,
} from '../../interfaces';
import { Signed } from './signed';

const visitorSignableFilterDid = (expectedDidData: DidData): ISignableOperationVisitor<boolean> => {
  return {
    addKey: (
      did: Did,
      _lastTxId: TransactionId | null,
      _newAuth: Authentication,
      _expiresAtHeight?: number,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    revokeKey: (
      did: Did,
      _lastTxId: TransactionId | null,
      _auth: Authentication,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    addRight: (
      did: Did,
      _lastTxId: TransactionId | null,
      _auth: Authentication,
      _right: Right,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    revokeRight: (
      did: Did,
      _lastTxId: TransactionId | null,
      _auth: Authentication,
      _right: Right,
    ): boolean => {
      return expectedDidData === did.toString();
    },
    tombstoneDid: (
      did: Did,
      _lastTxId: TransactionId | null,
    ): boolean => {
      return expectedDidData === did.toString();
    },
  };
};

export const visitorFilterDid = (expectedDidData: DidData): IOperationVisitor<SignableOperation[]> => {
  return {
    signed: (operations: ISignedOperationsData): SignableOperation[] => {
      const signableOperations = Signed.getOperationsUnsafeWithoutSignatureChecking(operations);
      const visitor = visitorSignableFilterDid(expectedDidData);
      return signableOperations.filter((op) => {
        return op.accept(visitor);
      });
    },
    registerBeforeProof: (_contentId: string): SignableOperation[] => {
      return [];
    },
  };
};
