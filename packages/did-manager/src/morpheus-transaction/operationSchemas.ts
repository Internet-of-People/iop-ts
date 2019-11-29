import { IOperationTypeVisitor, visitAll } from "./AllOperations";
import { registerBeforeProofSchema, revokeBeforeProofSchema } from './IOperationData';

class SchemaVisitor implements IOperationTypeVisitor<any> {
  public registerBeforeProof() {
    return registerBeforeProofSchema;
  }

  public revokeBeforeProof() {
    return revokeBeforeProofSchema;
  }
}

export const allSchemas = (): any[] => visitAll(new SchemaVisitor());
