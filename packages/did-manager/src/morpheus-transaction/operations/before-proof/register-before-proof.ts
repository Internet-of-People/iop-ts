import { IOperationVisitor, Operation, OperationType } from '../../../interfaces';

export class RegisterBeforeProof extends Operation {
  public constructor(public readonly contentId: string) {
    super();
  }

  public get type(): OperationType {
    return OperationType.RegisterBeforeProof;
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.registerBeforeProof(this.contentId);
  }
}
