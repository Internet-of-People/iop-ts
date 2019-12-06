import { IOperationVisitor } from '../../interfaces';
import { OperationType } from './operation-type';

/**
 * Interface of all operation model classes.
 */
export abstract class Operation {
  public abstract get type(): OperationType;
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}
