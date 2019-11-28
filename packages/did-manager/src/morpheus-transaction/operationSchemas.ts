import { OperationType } from './OperationType';

export const registerBeforeProofSchema = {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RegisterBeforeProof
    },
    params: {
      type: 'object',
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
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RevokeBeforeProof
    },
    params: {
      type: 'object',
      properties: {
        contentId: {
          type: 'string'
        }
      }
    }
  }
};
