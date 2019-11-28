interface IPoint<T> {
    height: number,
    value: T,
}

export class TimeSeries<T = boolean> {
  private static checkHeight(height: number) {
    if (!Number.isSafeInteger(height) || height < 0) {
      throw new Error('height must be a must be a non-negative integer');
    }
  }

  private points: Array<IPoint<T>> = [];

  public constructor(private initialValue: T) {}

  public set(height: number, value: T): void {
    TimeSeries.checkHeight(height);
    if (this.points.length && this.points[0].height >= height) {
      throw new Error('value was already set at that height');
    }
    const point = {height, value} as IPoint<T>;
    this.points.unshift(point);
  }

  public unset(height: number, value: T): void {
    if (!this.points.length) {
      throw new Error('nothing to unset');
    }
    const lastPoint = this.points[0];
    if (lastPoint.height !== height) {
      throw new Error('was set at a different height');
    }
    if (lastPoint.value !== value) {
      throw new Error('was set to a different value');
    }
    this.points.shift();
  }

  public get(height: number): T {
    TimeSeries.checkHeight(height);
    for (const point of this.points) {
      if (height >= point.height) {
        return point.value;
      }
    }
    return this.initialValue;
  }
}