import { ISignableOperationTypeVisitor } from '../../types/layer1/visitor';
import { OperationType } from '../operation-type';
import { visitAllSignableOperationTypes } from '../visitor';
import { addKeySchema } from './add-key';
import { revokeKeySchema } from './revoke-key';
import { addRightSchema } from './add-right';
import { revokeRightSchema } from './revoke-right';
import { tombstoneDidSchema } from './tombstone-did';

class SignableSchemaVisitor implements ISignableOperationTypeVisitor<unknown> {
  public addKey(): unknown {
    return addKeySchema();
  }

  public revokeKey(): unknown {
    return revokeKeySchema();
  }

  public addRight(): unknown {
    return addRightSchema();
  }

  public revokeRight(): unknown {
    return revokeRightSchema();
  }

  public tombstoneDid(): unknown {
    return tombstoneDidSchema();
  }
}

const signableOperationSchemas = (): unknown[] => {
  return visitAllSignableOperationTypes(new SignableSchemaVisitor());
};

export const signedSchema = (): unknown => {
  return {
    required: [ 'operation', 'signerPublicKey', 'signature', 'signables' ],
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
      signerPublicKey: {
        type: 'string',
      },
      signature: {
        type: 'string',
      },
    },
  };
};
