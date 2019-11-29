import { OperationType } from './IOperation';

export interface IOperationTypeVisitor<R> {
  registerBeforeProof(): R;
  revokeBeforeProof(): R;
}

export const visit = <R>(operation: string, visitor: IOperationTypeVisitor<R>): R => {
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

export const visitAll = <R>(visitor: IOperationTypeVisitor<R>): R[] => {
  return all.map(type => visit(type, visitor));
};
