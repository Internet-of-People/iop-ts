import {IOperation, IRegisterBeforeProofParam, IRevokeBeforeProofParam} from "./operations";
import {OperationType} from "./OperationType";

export class OperationAttemptsBuilder {
  private attempts: IOperation[] = [];

  public registerBeforeProof(params: IRegisterBeforeProofParam): OperationAttemptsBuilder {
    this.attempts.push({
      operation: OperationType.RegisterBeforeProof,
      params,
    });
    return this;
  }

  public revokeBeforeProof(params: IRevokeBeforeProofParam): OperationAttemptsBuilder {
    this.attempts.push({
      operation: OperationType.RevokeBeforeProof,
      params,
    });
    return this;
  }

  public getAttempts(): IOperation[] {
    return this.attempts;
  }
}
