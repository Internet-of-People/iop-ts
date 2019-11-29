import { IOperation } from "./IOperation";
import { erase, IOperationData, IRegisterBeforeProofParam, IRevokeBeforeProofParam } from "./IOperationData";
import { RegisterBeforeProof } from './RegisterBeforeProof';
import { RevokeBeforeProof } from './RevokeBeforeProof';

export class OperationAttemptsBuilder {
  private attempts: IOperation[] = [];

  public registerBeforeProof(params: IRegisterBeforeProofParam): OperationAttemptsBuilder {
    this.attempts.push(new RegisterBeforeProof(params.contentId));
    return this;
  }

  public revokeBeforeProof(params: IRevokeBeforeProofParam): OperationAttemptsBuilder {
    this.attempts.push(new RevokeBeforeProof(params.contentId));
    return this;
  }

  public getAttempts(): IOperationData[] {
    return this.attempts.map(op => erase(op));
  }
}
