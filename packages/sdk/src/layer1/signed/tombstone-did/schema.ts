import { SignableOperationType } from '../../operation-type';

export const tombstoneDidSchema = (): unknown => {
  return {
    type: 'object',
    required: [ 'operation', 'did', 'lastTxId' ],
    // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
    properties: {
      operation: {
        type: 'string',
        const: SignableOperationType.TombstoneDid,
      },
      did: {
        type: 'string',
      },
      lastTxId: {
        type: [ 'string', 'null' ],
      },
    },
  };
};
