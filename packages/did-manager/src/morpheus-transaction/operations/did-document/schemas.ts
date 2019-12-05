import {OperationType} from "../operation-type";

export const addKey = {
  type: 'object',
  required: ['operation', 'did', 'auth'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: OperationType.AddKey
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