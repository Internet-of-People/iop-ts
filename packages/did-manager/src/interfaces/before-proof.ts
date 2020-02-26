import { IState } from './state';

export interface IBeforeProofQueries {
  existsAt(height?: number): boolean;
}

export interface IBeforeProofOperations {
  register(height: number): void;
}

export type IBeforeProofState = IState<IBeforeProofQueries, IBeforeProofOperations>;
