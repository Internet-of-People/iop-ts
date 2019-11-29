import { IOperation, IOperationVisitor, OperationType } from './IOperation';

export class RevokeBeforeProof extends IOperation {
  public static readonly type = OperationType.RevokeBeforeProof;

  public constructor(public readonly contentId: string) {
    super();
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.revokeBeforeProof(this.contentId);
  }
}
