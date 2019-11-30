import { IOperationData } from "../../interfaces/operation-data";
import { RegisterBeforeProof, RevokeBeforeProof } from './before-proof';
import { Operation } from "./operation";
import { toData } from './to-data';

export class OperationAttemptsBuilder {
  private attempts: Operation[] = [];

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
