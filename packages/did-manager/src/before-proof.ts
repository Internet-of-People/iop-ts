import { TimeSeries } from "./time-series";

export interface IBeforeProofOperations {
  register(height: number): void;
  revoke(height: number): void;
}

export interface IBeforeProofState {
  readonly apply: IBeforeProofOperations;
  readonly revert: IBeforeProofOperations;

  existsAt(height: number): boolean;
}

export class BeforeProofState implements IBeforeProofState {

  public readonly apply: IBeforeProofOperations = {
    register: (height: number) => {
      if (this.periods.get(height)) {
        throw new Error(`Before proof ${this.contentId} is already registered at ${height}`);
      }
      this.periods.set(height, true);
    },
    revoke: (height: number) => {
      if (this.periods.get(height)) {
        throw new Error(`Before proof ${this.contentId} is not registered at ${height}`);
      }
      this.periods.set(height, false);
    },
  };

  public readonly revert: IBeforeProofOperations = {
    register: (height: number) => {
      this.periods.unset(height, true);
    },
    revoke: (height: number) => {
      this.periods.unset(height, false);
    },
  };

  private periods = new TimeSeries(false);

  public constructor(public readonly contentId: string) {}

  public existsAt(height: number): boolean {
    return this.periods.get(height);
  }
}
