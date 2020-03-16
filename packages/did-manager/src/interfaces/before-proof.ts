import { IState } from './state';
import { IO } from '@internet-of-people/sdk';

export interface IBeforeProofQueries {
  existsAt(height?: number): boolean;
  getHistoryAt(height: number): IBeforeProofHistory;
}

export interface IBeforeProofOperations {
  register(height: number): void;
}

export type IBeforeProofState = IState<IBeforeProofQueries, IBeforeProofOperations>;

export interface IBeforeProofHistory {
  contentId: IO.ContentId;
  existsFromHeight: number | null;
  queriedAtHeight: number;
}
