import { IOperationTypeVisitor } from '../types/layer1/visitor';
import { visitAllOperationTypes } from './visitor';
import { registerBeforeProofSchema } from './register-before-proof';
import { signedSchema } from './signed';

class SchemaVisitor implements IOperationTypeVisitor<unknown> {
  public signed(): unknown {
    return signedSchema();
  }

  public registerBeforeProof(): unknown {
    return registerBeforeProofSchema();
  }
}

export const operationSchemas = (): unknown[] => {
  return visitAllOperationTypes(new SchemaVisitor());
};
