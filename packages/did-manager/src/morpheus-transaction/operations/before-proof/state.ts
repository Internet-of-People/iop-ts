import {
  IBeforeProofOperations,
  IBeforeProofQueries,
  IBeforeProofState,
  IBeforeProofHistory,
} from '../../../interfaces';
import { ITimeSeries, TimeSeries } from '../../../time-series';

export class BeforeProofState implements IBeforeProofState {
  public readonly query: IBeforeProofQueries = {
    existsAt: (height?: number): boolean => {
      return height ?
        this.periods.query.get(height) :
        this.periods.query.latestValue();
    },

    getHistoryAt: (height: number): IBeforeProofHistory => {
      const latestHeight = this.periods.query.latestHeight();
      const existsFromHeight = latestHeight.isPresent() ? latestHeight.get() : null;
      const result: IBeforeProofHistory = {
        contentId: this.contentId,
        existsFromHeight,
        queriedAtHeight: height,
      };
      return result;
    },
  };

  public readonly apply: IBeforeProofOperations = {
    register: (height: number) => {
      if (this.periods.query.get(height)) {
        throw new Error(`Before proof ${this.contentId} is already registered at ${height}`);
      }
      this.periods.apply.set(height, true);
    },
  };

  public readonly revert: IBeforeProofOperations = {
    register: (height: number) => {
      this.periods.revert.set(height, true);
    },
  };

  private periods: ITimeSeries = new TimeSeries(false);

  public constructor(public readonly contentId: string) {}

  public clone(): IBeforeProofState {
    const cloned = new BeforeProofState(this.contentId);
    cloned.periods = this.periods.clone();
    return cloned;
  }
}
