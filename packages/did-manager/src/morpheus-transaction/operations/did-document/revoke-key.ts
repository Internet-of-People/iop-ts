import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type TransactionId = IO.TransactionId;

import {
  ISignableOperationVisitor,
  SignableOperation,
  SignableOperationType,
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
