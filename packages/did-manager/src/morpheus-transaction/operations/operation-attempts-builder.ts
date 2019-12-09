import {Authentication, Did, IOperationData} from '../../interfaces';
import { RegisterBeforeProof, RevokeBeforeProof } from './before-proof';
import {AddKey} from './did-document';
import { Operation } from './operation';
import { toData } from './to-data';
import {PersistentVault} from "@internet-of-people/keyvault";

export class OperationAttemptsBuilder {
  private attempts: Operation[] = [];
  private vault?: PersistentVault;

  public withVault(vault: PersistentVault) {
    this.vault = vault;
  }

  public registerBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RegisterBeforeProof(contentId));
    return this;
  }

  public revokeBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RevokeBeforeProof(contentId));
    return this;
  }

  public addKey(did: Did, auth: Authentication, expiresAtHeight?: number): OperationAttemptsBuilder {
    this.attempts.push(new AddKey(did, auth, expiresAtHeight));
    return this;
  }

  public getAttempts(): IOperationData[] {
    return this.attempts.map(op => toData(op));
  }
}
