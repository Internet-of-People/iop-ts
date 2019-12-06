export enum OperationType {
  RegisterBeforeProof = 'registerBeforeProof',
  RevokeBeforeProof = 'revokeBeforeProof',

  AddKey = 'addKey',
  RevokeKey = 'revokeKey',
  AddRight = 'addRight',
  RevokeRight = 'revokeRight',
  AddService = 'addService',
  // TODO consider having updateService
  RemoveService = 'removeService',
  TombstoneDid = 'tombstoneDid',
}
