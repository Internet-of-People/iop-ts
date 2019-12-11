import { IOperationVisitor, Operation, OperationType } from '../../../interfaces';

export class RevokeBeforeProof extends Operation {
  public constructor(public readonly contentId: string) {
    super();
  }

  public get type() { return OperationType.RevokeBeforeProof; }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.revokeBeforeProof(this.contentId);
  }
}
