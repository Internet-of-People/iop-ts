import { IOperationVisitor, OperationType } from '.';

export abstract class Operation {
  public abstract get type(): OperationType;
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}
