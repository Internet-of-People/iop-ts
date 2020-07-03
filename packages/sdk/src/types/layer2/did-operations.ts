import { TransactionId } from '../sdk';
import { ISignableOperationData, IOperationData } from '../layer1/operation-data';

export interface IDidOperation {
  transactionId: TransactionId;
  blockHeight: number;
  data: ISignableOperationData;
  valid: boolean;
}

export interface IDryRunOperationError {
  invalidOperationAttempt: IOperationData | undefined;
  // code: number; TODO: later we need exact error codes
  message: string;
}
