import {IOperation, IRegisterBeforeProofParam} from "./operations";
import {OperationType} from "./OperationType";

export class OperationAttemptsBuilder {
  private attempts: IOperation[] = [];

  public beforeProof(params: IRegisterBeforeProofParam): OperationAttemptsBuilder {
    this.attempts.push({
      operation: OperationType.RegisterBeforeProof,
      params,
    });
    return this;
  }

  public getAttempts(): IOperation[] {
    return this.attempts;
  }
}
