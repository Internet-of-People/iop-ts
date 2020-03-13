import { IO } from '@internet-of-people/sdk';
type Did = IO.Did;
type TransactionId = IO.TransactionId;

import {
  ISignableOperationVisitor,
  SignableOperation,
  SignableOperationType,
} from '../../../interfaces';

export class TombstoneDid extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: TransactionId | null,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.TombstoneDid;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.tombstoneDid(this.did, this.lastTxId);
  }
}
