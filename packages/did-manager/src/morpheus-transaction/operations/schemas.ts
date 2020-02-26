import { IOperationTypeVisitor } from '../../interfaces';
import { Schemas as BeforeProofSchemas } from './before-proof';
import { getSchema } from './signable-schemas';
import { visitAllOperationTypes } from './visitor';

class SchemaVisitor implements IOperationTypeVisitor<unknown> {
  public signed(): unknown {
    return getSchema();
  }

  public registerBeforeProof(): unknown {
    return BeforeProofSchemas.registerBeforeProofSchema;
  }
}

export const operationSchemas = (): unknown[] => {
  return visitAllOperationTypes(new SchemaVisitor());
};
