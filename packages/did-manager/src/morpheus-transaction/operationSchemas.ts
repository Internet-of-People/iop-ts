import { OperationType } from './OperationType';

export const registerBeforeProofSchema = {
  type: 'object',
  required: ['operation', 'params'],
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RegisterBeforeProof
    },
    params: {
      type: 'object',
      required: ['contentId'],
      properties: {
        contentId: {
          type: 'string'
        }
      }
    }
  }
};

export const revokeBeforeProofSchema = {
  type: 'object',
  required: ['operation', 'params'],
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RevokeBeforeProof
    },
    params: {
      type: 'object',
      required: ['contentId'],
      properties: {
        contentId: {
          type: 'string'
        }
      }
    }
  }
};
