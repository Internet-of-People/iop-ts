import {OperationType} from "../operation-type";

export const addKey = {
  type: 'object',
  required: ['operation', 'auth'],
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
    }
  }
};