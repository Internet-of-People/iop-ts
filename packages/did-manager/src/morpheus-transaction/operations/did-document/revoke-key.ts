import {
  Authentication,
  Did,
  ISignableOperationVisitor,
  SignableOperation,
  SignableOperationType,
  TransactionId,
} from '../../../interfaces';

export class RevokeKey extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: TransactionId | null,
    private readonly auth: Authentication,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.RevokeKey;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.revokeKey(this.did, this.lastTxId, this.auth);
  }
}
