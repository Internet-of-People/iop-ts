import { IOperationTypeVisitor } from '../../interfaces';
import { OperationType } from './operation-type';

export const visitOperation = <R>(operation: string, visitor: IOperationTypeVisitor<R>): R => {
  switch (operation) {
    case OperationType.RegisterBeforeProof:
      return visitor.registerBeforeProof();
    case OperationType.RevokeBeforeProof:
      return visitor.revokeBeforeProof();
    default: {
      throw new Error(`Unknown operation type ${operation}`);
    }
  }
};


// TODO generate this based on Object.keys(OperationType).filter(...).map(...)
const all: string[] = [
  OperationType.RegisterBeforeProof,
  OperationType.RevokeBeforeProof,
];

export const visitAllOperationTypes = <R>(visitor: IOperationTypeVisitor<R>): R[] => {
  return all.map(type => visitOperation(type, visitor));
};