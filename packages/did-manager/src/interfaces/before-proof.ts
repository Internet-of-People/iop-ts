import { Types } from '@internet-of-people/sdk';

export interface IBeforeProofQueries {
  existsAt(height?: number): boolean;
  getHistoryAt(height: number): Types.Layer2.IBeforeProofHistory;
}

export interface IBeforeProofOperations {
  register(height: number): void;
}

export type IBeforeProofState = Types.Layer2.IState<IBeforeProofQueries, IBeforeProofOperations>;
