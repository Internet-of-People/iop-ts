import { Did } from '@internet-of-people/morpheus-crypto';
import { ISignableOperationVisitor } from '../../../types/layer1';
import { Crypto, Sdk } from '../../../types';
import { SignableOperation } from '../../operation';
import { SignableOperationType } from '../../operation-type';

export class AddKey extends SignableOperation {
  public constructor(
    private readonly did: Did,
    private readonly lastTxId: Sdk.TransactionId | null,
    private readonly auth: Crypto.Authentication,
    private readonly expiresAtHeight: number | undefined,
  ) {
    super();
  }

  public get type(): SignableOperationType {
    return SignableOperationType.AddKey;
  }

  public accept<T>(visitor: ISignableOperationVisitor<T>): T {
    return visitor.addKey(this.did, this.lastTxId, this.auth, this.expiresAtHeight);
  }
}
