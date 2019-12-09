import { SignableOperationType } from '../../../interfaces';

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