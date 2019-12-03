import Optional from 'optional-js';
import { TimeSeries, ITimeSeries } from "../src/time-series";

describe('empty series', () => {
  let series: ITimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
  });

  it('returns initial value for valid heights', () => {
    let seriesInitiallyFalse: ITimeSeries = new TimeSeries(false);
    expect(seriesInitiallyFalse.query.get(0)).toBeFalsy();
    expect(seriesInitiallyFalse.query.latestValue()).toBeFalsy();

    let seriesInitiallyTrue: ITimeSeries = new TimeSeries(true);
    expect(seriesInitiallyTrue.query.get(0)).toBeTruthy();
    expect(seriesInitiallyTrue.query.latestValue()).toBeTruthy();
  });

  it('latestHeight return empty Optional<number>', () => {
    expect(series.query.latestHeight()).toStrictEqual(Optional.empty<number>());
  });

  for (const height of [0, 5, Number.MAX_SAFE_INTEGER]) {
    it(`apply set accepts valid height ${height}`, () => {
      series.apply.set(height, true);
      if (height - 1 >= 0) {
        expect(series.query.get(height - 1)).toBeFalsy();
      }
      expect(series.query.get(height)).toBeTruthy();
    });
  }

  for (const height of [Number.MIN_VALUE, 5.1, -1, Number.MAX_VALUE]) {
    it(`apply set rejects invalid height ${height}`, () => {
      expect(() => series.apply.set(height, true)).toThrowError('must be a non-negative integer');
    });
  }

  it('rejects revert set', () => {
    expect(() => series.revert.set(1, false)).toThrowError('nothing to unset')
  });
});

describe('single entry series', () => {
  let series: ITimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
    series.apply.set(5, true);
  });

  it('latestHeight return Optional.of(5)', () => {
    expect(series.query.latestHeight()).toStrictEqual(Optional.of(5));
  });

  it('rejects revert set with not matching height', () => {
    expect(() => series.revert.set(4, true)).toThrowError('was set at a different height');
  });

  it('rejects revert set with not matching value', () => {
    expect(() => series.revert.set(5, false)).toThrowError('was set to a different value');
  });

  it('accepts matching revert set', () => {
    series.revert.set(5, true);
    expect(series.query.get(5)).toBeFalsy();
  });

  const validCases: [number, boolean][] = [
    [0, false],
    [4, false],
    [5, true],
    [Number.MAX_SAFE_INTEGER, true]
  ];
  for (const [height, value]  of validCases) {
    it(`returns value ${value} at ${height}`, () => {
      expect(series.query.get(height)).toBe(value);
    });
  }

  it('get rejects invalid height', () => {
    expect(() => series.query.get(-1)).toThrowError('non-negative');
    expect(() => series.query.get(0.1)).toThrowError('integer');
  })

  for (const height of [5, 4, 0]) {
    it(`rejects already set height ${height}`, () => {
      expect(() => series.apply.set(height, true)).toThrowError('already set');
    });
  }

  for (const height of [6, Number.MAX_SAFE_INTEGER]) {
    it(`accepts new point at height ${height}`, () => {
      series.apply.set(height, true);
      expect(series.query.get(height)).toBeTruthy();
      expect(series.query.latestValue()).toBeTruthy();
    });
  }
});

describe('multiple entry series', () => {
  let series: ITimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
    series.apply.set(5, true);
    series.apply.set(6, false);
  });

  it('latestHeight return Optional.of(5)', () => {
    expect(series.query.latestHeight()).toStrictEqual(Optional.of(6));
  });

  it('rejects revert set with not matching height', () => {
    expect(() => series.revert.set(5, false)).toThrowError('was set at a different height');
  });

  it('rejects revert set with not matching value', () => {
    expect(() => series.revert.set(6, true)).toThrowError('was set to a different value');
  });

  it('accepts matching revert set', () => {
    series.revert.set(6, false);
    expect(series.query.get(6)).toBeTruthy();
    expect(series.query.latestValue()).toBeTruthy();
  });

  it('accepts multiple matching revert sets', () => {
    series.revert.set(6, false);
    series.revert.set(5, true);
    expect(series.query.get(6)).toBeFalsy();
    expect(series.query.latestValue()).toBeFalsy();
  });

  const validCases: [number, boolean][] = [
    [0, false],
    [4, false],
    [5, true],
    [6, false],
    [7, false],
    [Number.MAX_SAFE_INTEGER, false]
  ];
  for (const [height, value]  of validCases) {
    it(`returns value ${value} at ${height}`, () => {
      expect(series.query.get(height)).toBe(value);
    });
  }

  for (const height of [6, 5, 0]) {
    it(`rejects already set height ${height}`, () => {
      expect(() => series.apply.set(height, true)).toThrowError('already set');
    });
  }

  for (const height of [7, Number.MAX_SAFE_INTEGER]) {
    it(`accepts new point at height ${height}`, () => {
      series.apply.set(height, true);
      expect(series.query.get(height)).toBeTruthy();
    });
  }
});
