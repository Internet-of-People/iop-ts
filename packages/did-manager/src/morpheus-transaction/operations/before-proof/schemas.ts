import { OperationType } from '../../../interfaces';

export const registerBeforeProofSchema = {
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

export const revokeBeforeProofSchema = {
  required: [ 'operation', 'contentId' ],
  // additionalProperties: false, TODO: https://github.com/ArkEcosystem/core/issues/3340
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RevokeBeforeProof,
    },
    contentId: {
      type: 'string',
    },
  },
};
