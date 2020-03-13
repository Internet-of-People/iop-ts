import { Interfaces, KeyId } from '@internet-of-people/keyvault';
import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type Right = IO.Right;
type TransactionId = IO.TransactionId;

import {
  ISignedOperationsData,
  OperationType,
  SignableOperation,
} from '../../interfaces';
import { AddKey, AddRight, RevokeKey, RevokeRight, TombstoneDid } from './did-document';
import { OperationAttemptsBuilder } from './operation-attempts-builder';
import { toSignableData } from './to-signable-data';
import { Signed } from './signed';

export interface ISignedOperationBuilderNeedsDid {
  on(did: Did, lastTxId: TransactionId | null): ISignedOperationBuilder;
}

export interface ISignedOperationBuilder extends ISignedOperationBuilderNeedsDid {
  addKey(auth: Authentication, expiresAtHeight?: number): ISignedOperationBuilder;
  revokeKey(auth: Authentication): ISignedOperationBuilder;
  addRight(auth: Authentication, right: Right): ISignedOperationBuilder;
  revokeRight(auth: Authentication, right: Right): ISignedOperationBuilder;
  tombstoneDid(): ISignedOperationBuilder;

  sign(keyId: KeyId): OperationAttemptsBuilder;
}

export class SignedOperationAttemptsBuilder implements ISignedOperationBuilder {
  private readonly signableOperations: SignableOperation[] = [];
  private did: Did | null = null;
  private lastTxId: TransactionId | null = null;

  public constructor(
    private readonly finish: (operation: ISignedOperationsData) => OperationAttemptsBuilder,
    private readonly vault: Interfaces.IVault,
  ) {
  }

  public on(did: Did, lastTxId: TransactionId): ISignedOperationBuilder {
    this.did = did;
    this.lastTxId = lastTxId;
    return this;
  }

  /* eslint @typescript-eslint/no-non-null-assertion:0 */
  public addKey(auth: Authentication, expiresAtHeight?: number): ISignedOperationBuilder {
    this.signableOperations.push(new AddKey(this.did!, this.lastTxId, auth, expiresAtHeight));
    return this;
  }

  public revokeKey(auth: Authentication): ISignedOperationBuilder {
    this.signableOperations.push(new RevokeKey(this.did!, this.lastTxId, auth));
    return this;
  }

  public addRight(auth: Authentication, right: Right): ISignedOperationBuilder {
    this.signableOperations.push(new AddRight(this.did!, this.lastTxId, auth, right));
    return this;
  }

  public revokeRight(auth: Authentication, right: Right): ISignedOperationBuilder {
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
    const signedMessage = this.vault.sign(opBytes, keyId);
    const signedOperationData: ISignedOperationsData = {
      operation: OperationType.Signed,
      signables: signableOperationDatas,
      signerPublicKey: signedMessage.publicKey.toString(),
      signature: signedMessage.signature.toString(),
    };
    return this.finish(signedOperationData);
  }
}
