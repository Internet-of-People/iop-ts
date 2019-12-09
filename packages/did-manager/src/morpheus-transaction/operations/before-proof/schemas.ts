import { OperationType } from '../../../interfaces';

export const registerBeforeProofSchema = {
  type: 'object',
  required: ['operation', 'contentId'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RegisterBeforeProof
    },
    contentId: {
      type: 'string'
    }
  }
};

export const revokeBeforeProofSchema = {
  type: 'object',
  required: ['operation', 'contentId'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RevokeBeforeProof
    },
    contentId: {
      type: 'string'
    }
  }
};
