import { SignableOperationType } from '../../operation-type';

export const revokeKeySchema = (): unknown => {
  return {
    type: 'object',
    required: [ 'operation', 'did', 'lastTxId', 'auth' ],
    // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
    properties: {
      operation: {
        type: 'string',
        const: SignableOperationType.RevokeKey,
      },
      did: {
        type: 'string',
      },
      lastTxId: {
        type: [ 'string', 'null' ],
      },
      auth: {
        type: 'string',
      },
    },
  };
};
