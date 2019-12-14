import {
  Authentication,
  Did,
  ISignableOperationVisitor,
  Right,
  SignableOperation,
  SignableOperationType,
} from '../../../interfaces';

export class AddRight extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly auth: Authentication,
    private readonly right: Right,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.AddKey;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.addRight(this.did, this.auth, this.right);
  }
}
