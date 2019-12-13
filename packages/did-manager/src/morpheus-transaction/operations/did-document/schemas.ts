import { ALL_RIGHTS } from '.';
import { Right, SignableOperationType } from '../../../interfaces';


export const addKey = {
  type: 'object',
  required: ['operation', 'did', 'auth'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.AddKey
    },
    did: {
      type: 'string',
    },
    auth: {
      type: 'string'
    },
    expiresAtHeight: {
      type: 'number',
      minValue: 1,
    }
  }
};

export const addRight = {
  type: 'object',
  required: ['operation', 'did', 'auth', 'right'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.AddRight
    },
    did: {
      type: 'string',
    },
    auth: {
      type: 'string'
    },
    right: {
      type: 'string',
      enum: ALL_RIGHTS
    }
  }
};
