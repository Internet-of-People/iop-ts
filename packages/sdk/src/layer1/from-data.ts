import {
  IOperationData,
  IOperationTypeVisitor,
  IRegisterBeforeProofData,
  ISignedOperationsData,
} from '../types/layer1';
import { RegisterBeforeProof } from './register-before-proof';
import { Signed } from './signed';
import { Operation } from './operation';
import { visitOperation } from './visitor';

class FromData implements IOperationTypeVisitor<Operation> {
  public constructor(
    private readonly data: IOperationData,
  ) {}

  // TODO verify schema of params
  public signed(): Operation {
    const params = this.data as ISignedOperationsData;
    return new Signed(params);
  }

  public registerBeforeProof(): Operation {
    const params = this.data as IRegisterBeforeProofData;
    return new RegisterBeforeProof(params.contentId);
  }
}

export const fromData = (data: IOperationData): Operation => {
  return visitOperation(data.operation, new FromData(data));
};
