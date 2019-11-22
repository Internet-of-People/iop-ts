import { OperationType } from './OperationType';

export interface IOperation<T> {
  operation: OperationType;
  params: T;
}

export interface IAddKeyOperationParam {
  multiCipher: string;
  controllerDid?: string;
}
