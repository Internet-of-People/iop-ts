import { IOperationVisitor } from '../../../interfaces';
import { Operation } from '../operation';
import { OperationType } from '../operation-type';

export class RegisterBeforeProof extends Operation {
  public constructor(public readonly contentId: string) {
    super();
  }

  public get type() { return OperationType.RegisterBeforeProof; }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.registerBeforeProof(this.contentId);
  }
}
