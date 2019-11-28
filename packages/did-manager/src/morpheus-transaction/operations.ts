export interface IOperationParam {}

export interface IOperation {
  operation: string;
  params: IOperationParam;
}

export interface IRegisterBeforeProofParam extends IOperationParam {
  contentId: string;
}

export interface IRevokeBeforeProofParam extends IOperationParam {
  contentId: string;
}
