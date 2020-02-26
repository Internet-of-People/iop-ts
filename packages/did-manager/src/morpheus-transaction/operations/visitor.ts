import {
  IOperationTypeVisitor,
  ISignableOperationTypeVisitor,
  OperationType,
  SignableOperationType,
} from '../../interfaces';

export const visitOperation = <R>(operation: string, visitor: IOperationTypeVisitor<R>): R => {
  switch (operation) {
    case OperationType.Signed:
      return visitor.signed();
    case OperationType.RegisterBeforeProof:
      return visitor.registerBeforeProof();
    default:
      throw new Error(`Unknown operation type ${operation}`);
  }
};


// TODO generate this based on Object.keys(OperationType).filter(...).map(...)
const allOps: string[] = [
  OperationType.Signed,
  OperationType.RegisterBeforeProof,
];

export const visitAllOperationTypes = <R>(visitor: IOperationTypeVisitor<R>): R[] => {
  return allOps.map((type: string) => {
    return visitOperation(type, visitor);
  });
};


export const visitSignableOperation = <R>(operation: string, visitor: ISignableOperationTypeVisitor<R>): R => {
  switch (operation) {
    case SignableOperationType.AddKey:
      return visitor.addKey();
    case SignableOperationType.RevokeKey:
      return visitor.revokeKey();
    case SignableOperationType.AddRight:
      return visitor.addRight();
    case SignableOperationType.RevokeRight:
      return visitor.revokeRight();
    case SignableOperationType.TombstoneDid:
      return visitor.tombstoneDid();

    default: {
      throw new Error(`Unknown signable operation type ${operation}`);
    }
  }
};

const allSignableOps: string[] = [
  SignableOperationType.AddKey,
  SignableOperationType.RevokeKey,
  SignableOperationType.AddRight,
  SignableOperationType.RevokeRight,
  SignableOperationType.TombstoneDid,
];

export const visitAllSignableOperationTypes = <R>(visitor: ISignableOperationTypeVisitor<R>): R[] => {
  return allSignableOps.map((type: string) => {
    return visitSignableOperation(type, visitor);
  });
};
