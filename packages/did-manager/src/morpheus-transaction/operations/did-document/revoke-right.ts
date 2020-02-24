import {
  Authentication,
  Did,
  ISignableOperationVisitor,
  Right,
  SignableOperation,
  SignableOperationType,
  TransactionId,
} from '../../../interfaces';

export class RevokeRight extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: TransactionId | null,
    private readonly auth: Authentication,
    private readonly right: Right,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.RevokeRight;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.revokeRight(this.did, this.lastTxId, this.auth, this.right);
  }
}
