export enum OperationType {
  Signed = 'signed',

  RegisterBeforeProof = 'registerBeforeProof',
}

export enum SignableOperationType {
  AddKey = 'addKey',
  RevokeKey = 'revokeKey',
  AddRight = 'addRight',
  RevokeRight = 'revokeRight',
  TombstoneDid = 'tombstoneDid',
}
