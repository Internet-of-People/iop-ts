import { Did } from '@internet-of-people/morpheus-crypto';
import { ISignableOperationVisitor } from '../../../types/layer1';
import { Crypto, Sdk } from '../../../types';
import { SignableOperation } from '../../operation';
import { SignableOperationType } from '../../operation-type';

export class RevokeKey extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: Sdk.TransactionId | null,
    private readonly auth: Crypto.Authentication,
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
