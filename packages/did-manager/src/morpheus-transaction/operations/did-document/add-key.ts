import {
  Authentication,
  Did,
  ISignableOperationVisitor,
  SignableOperation,
  SignableOperationType,
} from '../../../interfaces';

export class AddKey extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly auth: Authentication,
    private readonly expiresAtHeight: number | undefined,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.AddKey;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.addKey(this.did, this.auth, this.expiresAtHeight);
  }
}
