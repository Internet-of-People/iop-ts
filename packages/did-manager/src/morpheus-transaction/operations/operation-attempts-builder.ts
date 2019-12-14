import { Interfaces } from '@internet-of-people/keyvault';
import { IOperationData, ISignedOperationsData, Operation } from '../../interfaces';
import { RegisterBeforeProof, RevokeBeforeProof } from './before-proof';
import { Signed } from './signed';
import { SignedOperationAttemptsBuilder } from './signed-operation-attempt-builder';
import { toData } from './to-data';

export class OperationAttemptsBuilder {
  private readonly attempts: Operation[] = [];

  public withVault(vault: Interfaces.IVault): SignedOperationAttemptsBuilder {
    return new SignedOperationAttemptsBuilder(this.signed.bind(this), vault);
  }

  public registerBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RegisterBeforeProof(contentId));
    return this;
  }

  public revokeBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RevokeBeforeProof(contentId));
    return this;
  }

  public getAttempts(): IOperationData[] {
    return this.attempts.map((op: Operation) => {
      return toData(op);
    });
  }

  private signed(data: ISignedOperationsData): OperationAttemptsBuilder {
    this.attempts.push(new Signed(data));
    return this;
  }
}
