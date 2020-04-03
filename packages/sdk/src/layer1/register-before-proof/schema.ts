import { OperationType } from '..';

export const registerBeforeProofSchema = (): unknown => {
  return {
    required: [ 'operation', 'contentId' ],
    // additionalProperties: false, TODO: https://github.com/ArkEcosystem/core/issues/3340
    properties: {
      operation: {
        type: 'string',
        const: OperationType.RegisterBeforeProof,
      },
      contentId: {
        type: 'string',
      },
    },
  };
};
