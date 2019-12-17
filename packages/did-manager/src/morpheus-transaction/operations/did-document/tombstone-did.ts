import {
  Did,
  ISignableOperationVisitor,
  SignableOperation,
  SignableOperationType,
} from '../../../interfaces';

export class TombstoneDid extends SignableOperation {
  public constructor(
    private readonly did: Did,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.TombstoneDid;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.tombstoneDid(this.did);
  }
}
