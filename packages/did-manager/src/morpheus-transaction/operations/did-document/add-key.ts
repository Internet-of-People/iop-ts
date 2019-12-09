import {Authentication, Did, ISignableOperationVisitor, SignableOperationType} from '../../../interfaces';
import { SignableOperation } from '../../../interfaces/operation';

export class AddKey extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly auth: Authentication,
    private readonly expiresAtHeight: number | undefined)
  {
    super();
  }

  public get type() { return SignableOperationType.AddKey; }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.addKey(this.did, this.auth, this.expiresAtHeight);
  }
}
