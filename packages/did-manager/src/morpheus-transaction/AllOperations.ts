import { RegisterBeforeProof } from "./RegisterBeforeProof";
import { RevokeBeforeProof } from "./RevokeBeforeProof";

export interface IOperationTypeVisitor<R> {
  registerBeforeProof(): R;
  revokeBeforeProof(): R;
}

const all: string[] = [
  RegisterBeforeProof.type,
  RevokeBeforeProof.type
];

export const visit = <R>(operation: string, visitor: IOperationTypeVisitor<R>): R => {
  switch (operation) {
    case RegisterBeforeProof.type: 
      return visitor.registerBeforeProof();
    case RevokeBeforeProof.type: 
      return visitor.revokeBeforeProof();
    default: {
      throw new Error(`Unknown operation type ${operation}`);
    }
  }
};

export const visitAll = <R>(visitor: IOperationTypeVisitor<R>): R[] => {
  return all.map(type => visit(type, visitor));
};
