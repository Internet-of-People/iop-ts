import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type Right = IO.Right;
type TransactionId = IO.TransactionId;

import {
  ISignableOperationVisitor,
  SignableOperation,
  SignableOperationType,
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
