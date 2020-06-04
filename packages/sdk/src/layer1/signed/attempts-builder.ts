import { Did, KeyId } from '@internet-of-people/morpheus-crypto';
import { Crypto, Sdk, Layer1 } from '../../types';
import { SignableOperation } from '../operation';
import { OperationType } from '../operation-type';
import { OperationAttemptsBuilder } from '../attempts-builder';
import { toSignableData } from './to-data';
import { Signed } from './operation';
import { AddKey } from './add-key';
import { AddRight } from './add-right';
import { RevokeKey } from './revoke-key';
import { RevokeRight } from './revoke-right';
import { TombstoneDid } from './tombstone-did';

export interface ISignedOperationBuilderNeedsDid {
  on(did: Did, lastTxId: Sdk.TransactionId | null): ISignedOperationBuilder;
}

export interface ISignedOperationBuilder extends ISignedOperationBuilderNeedsDid {
  addKey(auth: Crypto.Authentication, expiresAtHeight?: number): ISignedOperationBuilder;
  revokeKey(auth: Crypto.Authentication): ISignedOperationBuilder;
  addRight(auth: Crypto.Authentication, right: Sdk.Right): ISignedOperationBuilder;
  revokeRight(auth: Crypto.Authentication, right: Sdk.Right): ISignedOperationBuilder;
  tombstoneDid(): ISignedOperationBuilder;

  sign(keyId: KeyId): OperationAttemptsBuilder;
}

export class SignedOperationAttemptsBuilder implements ISignedOperationBuilder {
  private readonly signableOperations: SignableOperation[] = [];
  private did: Did | null = null;
  private lastTxId: Sdk.TransactionId | null = null;

  public constructor(
    private readonly finish: (operation: Layer1.ISignedOperationsData) => OperationAttemptsBuilder,
    private readonly signer: Crypto.IMorpheusSigner,
  ) {
  }

  public on(did: Did, lastTxId: Sdk.TransactionId): ISignedOperationBuilder {
    this.did = did;
    this.lastTxId = lastTxId;
    return this;
  }

  /* eslint @typescript-eslint/no-non-null-assertion:0 */
  public addKey(auth: Crypto.Authentication, expiresAtHeight?: number): ISignedOperationBuilder {
    this.signableOperations.push(new AddKey(this.did!, this.lastTxId, auth, expiresAtHeight));
    return this;
  }

  public revokeKey(auth: Crypto.Authentication): ISignedOperationBuilder {
    this.signableOperations.push(new RevokeKey(this.did!, this.lastTxId, auth));
    return this;
  }

  public addRight(auth: Crypto.Authentication, right: Sdk.Right): ISignedOperationBuilder {
    this.signableOperations.push(new AddRight(this.did!, this.lastTxId, auth, right));
    return this;
  }

  public revokeRight(auth: Crypto.Authentication, right: Sdk.Right): ISignedOperationBuilder {
    this.signableOperations.push(new RevokeRight(this.did!, this.lastTxId, auth, right));
    return this;
  }

  public tombstoneDid(): ISignedOperationBuilder {
    this.signableOperations.push(new TombstoneDid(this.did!, this.lastTxId));
    return this;
  }

  public sign(keyId: KeyId): OperationAttemptsBuilder {
    const signableOperationDatas = this.signableOperations.map(toSignableData);
    const opBytes = Signed.serialize(signableOperationDatas);
    const signedMessage = this.signer.signDidOperations(keyId, opBytes);
    const signedOperationData: Layer1.ISignedOperationsData = {
      operation: OperationType.Signed,
      signables: signableOperationDatas,
      signerPublicKey: signedMessage.publicKey.toString(),
      signature: signedMessage.signature.toString(),
    };
    return this.finish(signedOperationData);
  }
}
