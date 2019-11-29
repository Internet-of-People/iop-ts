import { IOperationTypeVisitor, visitAll } from "./AllOperations";
import { registerBeforeProofSchema } from './RegisterBeforeProof';
import { revokeBeforeProofSchema } from './RevokeBeforeProof';

class SchemaVisitor implements IOperationTypeVisitor<any> {
  public registerBeforeProof() {
    return registerBeforeProofSchema;
  }

  public revokeBeforeProof() {
    return revokeBeforeProofSchema;
  }
}

export const allSchemas = (): any[] => visitAll(new SchemaVisitor());
