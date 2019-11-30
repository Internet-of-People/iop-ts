import { OperationData } from '../morpheus-transaction/operations';

export interface IMorpheusAsset {
  operationAttempts: OperationData.IOperationData[];
}