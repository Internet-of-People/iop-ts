import {
  IOperationData,
  IOperationTypeVisitor,
  IRegisterBeforeProofData,
  IRevokeBeforeProofData,
  ISignedOperationsData,
  Operation
} from '../../interfaces';
import { RegisterBeforeProof, RevokeBeforeProof } from './before-proof';
import { Signed } from './signed';
import { visitOperation } from './visitor';

class FromData implements IOperationTypeVisitor<Operation> {
  public constructor(
    private readonly data: IOperationData
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

  public revokeBeforeProof(): Operation {
    const params = this.data as IRevokeBeforeProofData;
    return new RevokeBeforeProof(params.contentId);
  }
}

export const fromData = (data: IOperationData): Operation => {
  return visitOperation(data.operation, new FromData(data));
};
