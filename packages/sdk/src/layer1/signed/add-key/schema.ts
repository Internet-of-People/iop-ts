import { SignableOperationType } from '../../operation-type';

export const addKeySchema = (): unknown => {
  return {
    type: 'object',
    required: [ 'operation', 'did', 'lastTxId', 'auth' ],
    // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
    properties: {
      operation: {
        type: 'string',
        const: SignableOperationType.AddKey,
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
      expiresAtHeight: {
        type: 'number',
        minValue: 1,
      },
    },
  };
};
