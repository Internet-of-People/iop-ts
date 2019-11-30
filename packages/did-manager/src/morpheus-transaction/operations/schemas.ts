import { IOperationTypeVisitor } from '../../interfaces';
import { Schemas } from './before-proof';
import { visitAllOperationTypes } from "./visitor";

class SchemaVisitor implements IOperationTypeVisitor<any> {
  public registerBeforeProof() {
    return Schemas.registerBeforeProofSchema;
  }

  public revokeBeforeProof() {
    return Schemas.revokeBeforeProofSchema;
  }
}

export const operationSchemas = (): any[] => visitAllOperationTypes(new SchemaVisitor());
