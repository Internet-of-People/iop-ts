import { IOperationVisitor } from '../../../interfaces';
import { Operation } from '../operation';
import { OperationType } from '../operation-type';

export class RevokeBeforeProof extends Operation {
  public static readonly type = OperationType.RevokeBeforeProof;

  public constructor(public readonly contentId: string) {
    super();
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.revokeBeforeProof(this.contentId);
  }
}
