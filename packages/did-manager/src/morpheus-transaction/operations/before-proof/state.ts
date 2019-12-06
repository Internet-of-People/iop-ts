import { IBeforeProofOperations, IBeforeProofQueries, IBeforeProofState } from '../../../interfaces';
import { ITimeSeries, TimeSeries } from '../../../time-series';

export class BeforeProofState implements IBeforeProofState {
  public readonly query: IBeforeProofQueries = {
    existsAt: (height?: number): boolean => {
      return height === undefined ?
        this.periods.query.latestValue() :
        this.periods.query.get(height);
    }
  };

  public readonly apply: IBeforeProofOperations = {
    register: (height: number) => {
      if (this.periods.query.get(height)) {
        throw new Error(`Before proof ${this.contentId} is already registered at ${height}`);
      }
      this.periods.apply.set(height, true);
    },
    revoke: (height: number) => {
      if (!this.periods.query.get(height)) {
        throw new Error(`Before proof ${this.contentId} is not registered at ${height}`);
      }
      this.periods.apply.set(height, false);
    },
  };

  public readonly revert: IBeforeProofOperations = {
    register: (height: number) => {
      this.periods.revert.set(height, true);
    },
    revoke: (height: number) => {
      this.periods.revert.set(height, false);
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
