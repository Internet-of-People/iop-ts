import { IOperationVisitor } from '../../interfaces';
import { OperationType } from './operation-type';

/**
 * Interface of all operation model classes.
 */
export abstract class Operation {
  public static readonly type: OperationType;

  public get type(): OperationType { return (this as any).__proto__.constructor.type; }
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}
