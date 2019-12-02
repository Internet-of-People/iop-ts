export interface IBeforeProofQueries {
  existsAt(height?: number): boolean;
}

export interface IBeforeProofOperations {
  register(height: number): void;
  revoke(height: number): void;
}

export interface IBeforeProofState {
  readonly query: IBeforeProofQueries;
  readonly apply: IBeforeProofOperations;
  readonly revert: IBeforeProofOperations;
}
