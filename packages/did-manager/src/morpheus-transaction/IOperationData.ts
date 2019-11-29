import { OperationType } from './IOperation';

/**
 * Data transfer object for IOperation implementations.
 */
export interface IOperationData {
  operation: OperationType;
}

/**
 * Data transfer object of RegisterBeforeProof.
 */
export interface IRegisterBeforeProofData extends IOperationData {
  contentId: string;
}

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

/**
 * Data transfer object of RevokeBeforeProof.
 */
export interface IRevokeBeforeProofData extends IOperationData {
  contentId: string;
}

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
