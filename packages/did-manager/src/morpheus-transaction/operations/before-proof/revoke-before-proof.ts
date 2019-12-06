import { IOperationVisitor } from '../../../interfaces';
import { Operation } from '../operation';
import { OperationType } from '../operation-type';

export class RevokeBeforeProof extends Operation {
  public constructor(public readonly contentId: string) {
    super();
  }

  public get type() { return OperationType.RevokeBeforeProof; }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.revokeBeforeProof(this.contentId);
  }
}
