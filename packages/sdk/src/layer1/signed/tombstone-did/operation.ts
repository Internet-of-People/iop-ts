import { Did } from '@internet-of-people/morpheus-crypto';
import { ISignableOperationVisitor } from '../../../types/layer1';
import { Sdk } from '../../../types';
import { SignableOperation } from '../../operation';
import { SignableOperationType } from '../../operation-type';

export class TombstoneDid extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: Sdk.TransactionId | null,
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
