import { IOperationTypeVisitor } from '../../interfaces';
import { Schemas as BeforeProofSchemas } from './before-proof';
import { Schemas as DidDocumentSchemas } from './did-document';
import { visitAllOperationTypes } from "./visitor";

class SchemaVisitor implements IOperationTypeVisitor<unknown> {
  public registerBeforeProof(): unknown {
    return BeforeProofSchemas.registerBeforeProofSchema;
  }

  public revokeBeforeProof(): unknown {
    return BeforeProofSchemas.revokeBeforeProofSchema;
  }

  public addKey(): unknown {
    return DidDocumentSchemas.addKey;
  }
}

export const operationSchemas = (): any[] => visitAllOperationTypes(new SchemaVisitor());
