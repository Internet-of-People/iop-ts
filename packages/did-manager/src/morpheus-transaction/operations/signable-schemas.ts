import { ISignableOperationTypeVisitor, OperationType } from '../../interfaces';
import { Schemas as DidDocumentSchemas } from './did-document';
import { visitAllSignableOperationTypes } from './visitor';

class SignableSchemaVisitor implements ISignableOperationTypeVisitor<unknown> {
  public addKey(): unknown {
    return DidDocumentSchemas.addKey;
  }
  public revokeKey(): unknown {
    return DidDocumentSchemas.revokeKey;
  }
  public addRight(): unknown {
    return DidDocumentSchemas.addRight;
  }
  public revokeRight(): unknown {
    return DidDocumentSchemas.revokeRight;
  }
}

const signableOperationSchemas = (): unknown[] => {
  return visitAllSignableOperationTypes(new SignableSchemaVisitor());
};

export const getSchema = (): unknown => {
  return {
    required: [ 'operation', 'publicKey', 'signature', 'signables' ],
    // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
    properties: {
      operation: {
        type: 'string',
        const: OperationType.Signed,
      },
      signables: {
        type: 'array',
        items: {
          anyOf: signableOperationSchemas(),
        },
      },
      publicKey: {
        type: 'string',
      },
      signature: {
        type: 'string',
      },
    },
  };
};
