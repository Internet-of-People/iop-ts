import {
  Authentication,
  Did,
  ISignableOperationVisitor,
  Right,
  SignableOperation,
  SignableOperationType,
} from '../../../interfaces';

export class RevokeRight extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly auth: Authentication,
    private readonly right: Right,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.RevokeRight;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.revokeRight(this.did, this.auth, this.right);
  }
}
