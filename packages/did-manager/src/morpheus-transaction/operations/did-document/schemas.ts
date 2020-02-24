import { SignableOperationType } from '../../../interfaces';

export const addKey = {
  type: 'object',
  required: [ 'operation', 'did', 'lastTxId', 'auth' ],
  // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.AddKey,
    },
    did: {
      type: 'string',
    },
    lastTxId: {
      type: [ 'string', 'null' ],
    },
    auth: {
      type: 'string',
    },
    expiresAtHeight: {
      type: 'number',
      minValue: 1,
    },
  },
};

export const revokeKey = {
  type: 'object',
  required: [ 'operation', 'did', 'lastTxId', 'auth' ],
  // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.RevokeKey,
    },
    did: {
      type: 'string',
    },
    lastTxId: {
      type: [ 'string', 'null' ],
    },
    auth: {
      type: 'string',
    },
  },
};

export const addRight = {
  type: 'object',
  required: [ 'operation', 'did', 'lastTxId', 'auth', 'right' ],
  // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.AddRight,
    },
    did: {
      type: 'string',
    },
    lastTxId: {
      type: [ 'string', 'null' ],
    },
    auth: {
      type: 'string',
    },
    right: {
      type: 'string',
    },
  },
};

export const revokeRight = {
  type: 'object',
  required: [ 'operation', 'did', 'lastTxId', 'auth', 'right' ],
  // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.RevokeRight,
    },
    did: {
      type: 'string',
    },
    lastTxId: {
      type: [ 'string', 'null' ],
    },
    auth: {
      type: 'string',
    },
    right: {
      type: 'string',
    },
  },
};

export const tombstoneDid = {
  type: 'object',
  required: [ 'operation', 'did', 'lastTxId' ],
  // additionalProperties: false, // TODO: https://github.com/ArkEcosystem/core/issues/3340
  properties: {
    operation: {
      type: 'string',
      const: SignableOperationType.TombstoneDid,
    },
    did: {
      type: 'string',
    },
    lastTxId: {
      type: [ 'string', 'null' ],
    },
  },
};
