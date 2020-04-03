import { Types } from '@internet-of-people/sdk';
import { IState } from './state';

export interface IBeforeProofQueries {
  existsAt(height?: number): boolean;
  getHistoryAt(height: number): Types.Layer2.IBeforeProofHistory;
}

export interface IBeforeProofOperations {
  register(height: number): void;
}

export type IBeforeProofState = IState<IBeforeProofQueries, IBeforeProofOperations>;
