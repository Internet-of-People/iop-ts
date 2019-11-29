import { TimeSeries } from "./time-series";

export interface IBeforeProofQueries {
  existsAt(height: number): boolean;
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

export class BeforeProofState implements IBeforeProofState {

  public readonly query: IBeforeProofQueries = {
    existsAt: (height: number): boolean => {
      return this.periods.query.get(height);
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
      if (this.periods.query.get(height)) {
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

  private periods = new TimeSeries(false);

  public constructor(public readonly contentId: string) {}
}
