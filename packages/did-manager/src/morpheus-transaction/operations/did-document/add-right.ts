import {
  Authentication,
  Did,
  ISignableOperationVisitor,
  Right,
  SignableOperation,
  SignableOperationType,
  TransactionId,
} from '../../../interfaces';

export class AddRight extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: TransactionId | null,
    private readonly auth: Authentication,
    private readonly right: Right,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.AddRight;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.addRight(this.did, this.lastTxId, this.auth, this.right);
  }
}
