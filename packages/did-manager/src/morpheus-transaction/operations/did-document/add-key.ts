import {Authentication, Did, IOperationVisitor} from '../../../interfaces';
import { Operation } from '../operation';
import { OperationType } from '../operation-type';

export class AddKey extends Operation {
  public static readonly type = OperationType.AddKey;

  public constructor(
    private readonly did: Did,
    private readonly auth: Authentication,
    private readonly expiresAtHeight: number | undefined)
  {
    super();
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.addKey(this.did, this.auth, this.expiresAtHeight);
  }
}
