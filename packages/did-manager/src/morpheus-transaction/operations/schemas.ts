import {IOperationTypeVisitor } from '../../interfaces';
import { Schemas as BeforeProofSchemas } from './before-proof';
import {visitAllOperationTypes } from './visitor';
import {getSchema} from './signable-schemas'

class SchemaVisitor implements IOperationTypeVisitor<unknown> {
  public signed(): unknown {
    return getSchema();
  }

  public registerBeforeProof(): unknown {
    return BeforeProofSchemas.registerBeforeProofSchema;
  }

  public revokeBeforeProof(): unknown {
    return BeforeProofSchemas.revokeBeforeProofSchema;
  }
}

export const operationSchemas = (): any[] => visitAllOperationTypes(new SchemaVisitor());
