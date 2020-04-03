import { IOperationVisitor } from '../../types/layer1';
import { Operation } from '../operation';
import { OperationType } from '../operation-type';

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
