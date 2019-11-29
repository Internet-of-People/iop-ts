import { IOperation } from "./IOperation";
import { IOperationData } from "./IOperationData";
import { RegisterBeforeProof } from './RegisterBeforeProof';
import { RevokeBeforeProof } from './RevokeBeforeProof';
import { toData } from './ToData';

export class OperationAttemptsBuilder {
  private attempts: IOperation[] = [];

  public registerBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RegisterBeforeProof(contentId));
    return this;
  }

  public revokeBeforeProof(contentId: string): OperationAttemptsBuilder {
    this.attempts.push(new RevokeBeforeProof(contentId));
    return this;
  }

  public getAttempts(): IOperationData[] {
    return this.attempts.map(op => toData(op));
  }
}
