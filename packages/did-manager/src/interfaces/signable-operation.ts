import { SignableOperationType } from './operation-type';
import { ISignableOperationVisitor } from './visitor';

export abstract class SignableOperation {
  public abstract get type(): SignableOperationType;
  public abstract accept<T>(visitor: ISignableOperationVisitor<T>): T;
}
