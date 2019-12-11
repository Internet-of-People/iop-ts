import {
  IOperationTypeVisitor,
  ISignableOperationTypeVisitor,
  OperationType,
  SignableOperationType
} from '../../interfaces';

export const visitOperation = <R>(operation: string, visitor: IOperationTypeVisitor<R>): R => {
  switch (operation) {
    case OperationType.Signed:
      return visitor.signed();
    case OperationType.RegisterBeforeProof:
      return visitor.registerBeforeProof();
    case OperationType.RevokeBeforeProof:
      return visitor.revokeBeforeProof();
    default:
      throw new Error(`Unknown operation type ${operation}`);
  }
};


// TODO generate this based on Object.keys(OperationType).filter(...).map(...)
const allOps: string[] = [
  OperationType.Signed,
  OperationType.RegisterBeforeProof,
  OperationType.RevokeBeforeProof,
];

export const visitAllOperationTypes = <R>(visitor: IOperationTypeVisitor<R>): R[] => {
  return allOps.map(type => visitOperation(type, visitor));
};


export const visitSignableOperation = <R>(operation: string, visitor: ISignableOperationTypeVisitor<R>): R => {
  switch (operation) {
    case SignableOperationType.AddKey:
      return visitor.addKey();
    default: {
      throw new Error(`Unknown signable operation type ${operation}`);
    }
  }
};

const allSignableOps: string[] = [
  SignableOperationType.AddKey,
];

export const visitAllSignableOperationTypes = <R>(visitor: ISignableOperationTypeVisitor<R>): R[] => {
  return allSignableOps.map(type => visitSignableOperation(type, visitor));
};
