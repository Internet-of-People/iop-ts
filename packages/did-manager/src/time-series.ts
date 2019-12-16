import deepClone from 'lodash.clonedeep';
import Optional from 'optional-js';

import { IState } from './interfaces';

interface IPoint<T> {
  height: number;
  value: T;
}

export interface ITimeSeriesQueries<T> {
  get(height: number): T;
  isEmpty(): boolean;
  latestValue(): T;
  latestHeight(): Optional<number>;
}

export interface ITimeSeriesOperations<T> {
  set(height: number, value: T): void;
}

export type ITimeSeries<T = boolean> = IState<ITimeSeriesQueries<T>, ITimeSeriesOperations<T>>;

export class TimeSeries<T = boolean> implements ITimeSeries<T> {
  public readonly apply: ITimeSeriesOperations<T> = {
    set: (height: number, value: T): void => {
      TimeSeries.checkHeight(height);

      if (this.points.length && this.points[0].height >= height) {
        throw new Error('value was already set at that height');
      }

      if (this.points.length && this.points[0].value === value) {
        throw new Error(`value was already set to ${value}`);
      }

      const point: IPoint<T> = { height, value };
      this.points.unshift(point);
    },
  };

  public readonly revert: ITimeSeriesOperations<T> = {
    set: (height: number, value: T): void => {
      if (!this.points.length) {
        throw new Error('nothing to unset');
      }
      const [lastPoint] = this.points;

      if (lastPoint.height !== height) {
        throw new Error('was set at a different height');
      }

      if (lastPoint.value !== value) {
        throw new Error('was set to a different value');
      }
      this.points.shift();
    },
  };

  public readonly query: ITimeSeriesQueries<T> = {
    get: (height: number): T => {
      TimeSeries.checkHeight(height);

      for (const point of this.points) {
        if (height >= point.height) {
          return point.value;
        }
      }
      return this.initialValue;
    },

    latestValue: (): T => {
      return this.points.length ? this.points[0].value : this.initialValue;
    },

    latestHeight: (): Optional<number> => {
      return this.points.length ? Optional.of(this.points[0].height) : Optional.empty();
    },

    isEmpty: (): boolean => {
      return this.points.length === 0;
    },
  };

  private points: IPoint<T>[] = [];

  public constructor(private readonly initialValue: T) {}

  private static checkHeight(height: number): void {
    if (!Number.isSafeInteger(height) || height < 0) {
      throw new Error('height must be a must be a non-negative integer');
    }
  }

  public clone(): ITimeSeries<T> {
    const cloned = new TimeSeries<T>(this.initialValue);
    cloned.points = deepClone(this.points);
    return cloned;
  }
}
