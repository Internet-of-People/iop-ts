import { Crypto } from '../types';
import { IOperationData, ISignedOperationsData } from '../types/layer1';
import { Operation } from './operation';
import { RegisterBeforeProof } from './register-before-proof';
import { Signed } from './signed';
import { SignedOperationAttemptsBuilder, ISignedOperationBuilderNeedsDid } from './signed/attempts-builder';
import { toData } from './to-data';

export class OperationAttemptsBuilder {
  private readonly attempts: Operation[] = [];

  public withVault(vault: Crypto.IVault): ISignedOperationBuilderNeedsDid {
    return new SignedOperationAttemptsBuilder(this.signed.bind(this), vault);
  }

  public registerBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RegisterBeforeProof(contentId));
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
