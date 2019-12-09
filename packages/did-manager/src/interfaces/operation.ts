import {IOperationVisitor, ISignableOperationVisitor, OperationType, SignableOperationType} from '.';

/**
 * Interface of all operation model classes.
 */
export abstract class Operation {
  public abstract get type(): OperationType;
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}

export abstract class SignableOperation {
  public abstract get type(): SignableOperationType;
  public abstract accept<T>(visitor: ISignableOperationVisitor<T>): T;
}
