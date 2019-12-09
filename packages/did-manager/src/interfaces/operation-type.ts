export enum OperationType {
  Signed = 'signed',

  RegisterBeforeProof = 'registerBeforeProof',
  RevokeBeforeProof = 'revokeBeforeProof',
}

export enum SignableOperationType {
  AddKey = 'addKey',
  RevokeKey = 'revokeKey',
  AddRight = 'addRight',
  RevokeRight = 'revokeRight',
  AddService = 'addService',
  // TODO consider having updateService
  RemoveService = 'removeService',
  TombstoneDid = 'tombstoneDid',
}