import { IOperationVisitor } from './visitor';
import { OperationType } from './operation-type';

export abstract class Operation {
  public abstract get type(): OperationType;
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}
