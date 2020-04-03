/* eslint max-classes-per-file: 0 */
import { IOperationVisitor, ISignableOperationVisitor } from '../types/layer1/visitor';
import { OperationType, SignableOperationType } from './operation-type';

export abstract class Operation {
  public abstract get type(): OperationType;
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}

export abstract class SignableOperation {
  public abstract get type(): SignableOperationType;
  public abstract accept<T>(visitor: ISignableOperationVisitor<T>): T;
}
