import { OperationType } from './OperationType';

export const registerBeforeProofSchema = {
  properties: {
    operation: OperationType.RegisterBeforeProof,
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