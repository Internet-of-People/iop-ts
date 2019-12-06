import {Authentication, Did, IOperationVisitor} from '../../../interfaces';
import { Operation } from '../operation';
import { OperationType } from '../operation-type';

export class AddKey extends Operation {
  public constructor(
    private readonly did: Did,
    private readonly auth: Authentication,
    private readonly expiresAtHeight: number | undefined)
  {
    super();
  }

  public get type() { return OperationType.AddKey; }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.addKey(this.did, this.auth, this.expiresAtHeight);
  }
}
