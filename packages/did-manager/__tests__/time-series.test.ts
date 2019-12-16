import Optional from 'optional-js';
import { ITimeSeries, TimeSeries } from '../src/time-series';

describe('clonable series', () => {
  let oldSeries: ITimeSeries;
  let newSeries: ITimeSeries;

  beforeEach(() => {
    oldSeries = new TimeSeries(false);
    oldSeries.apply.set(5, true);
    newSeries = oldSeries.clone();
  });

  it('existing points are cloned', () => {
    expect(newSeries.query.get(5)).toBeTruthy();
  });

  it('removing points from old does not affect clone', () => {
    oldSeries.revert.set(5, true);
    expect(oldSeries.query.get(5)).toBeFalsy();
    expect(newSeries.query.get(5)).toBeTruthy();
  });

  it('removing points from clone does not affect old one', () => {
    newSeries.revert.set(5, true);
    expect(newSeries.query.get(5)).toBeFalsy();
    expect(oldSeries.query.get(5)).toBeTruthy();
  });

  it('adding new point does not affect old one', () => {
    newSeries.apply.set(7, false);
    expect(newSeries.query.get(7)).toBeFalsy();
    expect(oldSeries.query.get(7)).toBeTruthy();
  });
});

describe('empty series', () => {
  let series: ITimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
  });

  it('returns initial value for valid heights', () => {
    const seriesInitiallyFalse: ITimeSeries = new TimeSeries(false);
    expect(seriesInitiallyFalse.query.get(0)).toBeFalsy();
    expect(seriesInitiallyFalse.query.latestValue()).toBeFalsy();

    const seriesInitiallyTrue: ITimeSeries = new TimeSeries(true);
    expect(seriesInitiallyTrue.query.get(0)).toBeTruthy();
    expect(seriesInitiallyTrue.query.latestValue()).toBeTruthy();
  });

  it('latestHeight return empty Optional<number>', () => {
    expect(series.query.latestHeight()).toStrictEqual(Optional.empty<number>());
  });

  for (const height of [ 0, 5, Number.MAX_SAFE_INTEGER ]) {
    it(`apply set accepts valid height ${height}`, () => {
      /* eslint no-loop-func: 0 */
      series.apply.set(height, true);

      if (height - 1 >= 0) {
        expect(series.query.get(height - 1)).toBeFalsy();
      }
      expect(series.query.get(height)).toBeTruthy();
    });
  }

  for (const height of [ Number.MIN_VALUE, 5.1, -1, Number.MAX_VALUE ]) {
    it(`apply set rejects invalid height ${height}`, () => {
      expect(() => {
        /* eslint no-loop-func: 0 */
        return series.apply.set(height, true);
      }).toThrowError('must be a non-negative integer');
    });
  }

  it('rejects revert set', () => {
    expect(() => {
      return series.revert.set(1, false);
    }).toThrowError('nothing to unset');
  });
});

describe('single entry series', () => {
  let series: ITimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
    series.apply.set(5, true);
  });

  it('apply fails if value was already set to the same', () => {
    expect(() => {
      series.apply.set(6, true);
    }).toThrowError('value was already set to true');
  });

  it('latestHeight return Optional.of(5)', () => {
    expect(series.query.latestHeight()).toStrictEqual(Optional.of(5));
  });

  it('rejects revert set with not matching height', () => {
    expect(() => {
      return series.revert.set(4, true);
    }).toThrowError('was set at a different height');
  });

  it('rejects revert set with not matching value', () => {
    expect(() => {
      return series.revert.set(5, false);
    }).toThrowError('was set to a different value');
  });

  it('accepts matching revert set', () => {
    series.revert.set(5, true);
    expect(series.query.get(5)).toBeFalsy();
  });

  const validCases: [number, boolean][] = [
    [ 0, false ],
    [ 4, false ],
    [ 5, true ],
    [ Number.MAX_SAFE_INTEGER, true ],
  ];

  for (const [ height, value ] of validCases) {
    it(`returns value ${value} at ${height}`, () => {
      expect(series.query.get(height)).toBe(value);
    });
  }

  it('get rejects invalid height', () => {
    expect(() => {
      return series.query.get(-1);
    }).toThrowError('non-negative');
    expect(() => {
      return series.query.get(0.1);
    }).toThrowError('integer');
  });

  for (const height of [ 5, 4, 0 ]) {
    it(`rejects already set height ${height}`, () => {
      expect(() => {
        return series.apply.set(height, true);
      }).toThrowError('already set');
    });
  }

  for (const height of [ 6, Number.MAX_SAFE_INTEGER ]) {
    it(`accepts new point at height ${height}`, () => {
      const setTo = !series.query.get(height);
      series.apply.set(height, setTo);
      expect(series.query.get(height)).toBe(setTo);
      expect(series.query.latestValue()).toBe(setTo);
    });
  }

  it('truthy initial value can be changed into falsy', () => {
    const trueSeries = new TimeSeries(true);
    expect(trueSeries.query.latestValue()).toBeTruthy();
    expect(trueSeries.query.get(5)).toBeTruthy();
    expect(trueSeries.query.latestHeight()).toStrictEqual(Optional.empty());

    trueSeries.apply.set(5, false);
    expect(trueSeries.query.get(4)).toBeTruthy();
    expect(trueSeries.query.latestValue()).toBeFalsy();
    expect(trueSeries.query.get(5)).toBeFalsy();
    expect(trueSeries.query.latestHeight()).toStrictEqual(Optional.of(5));
  });
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
    expect(() => {
      return series.revert.set(5, false);
    }).toThrowError('was set at a different height');
  });

  it('rejects revert set with not matching value', () => {
    expect(() => {
      return series.revert.set(6, true);
    }).toThrowError('was set to a different value');
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
    [ 0, false ],
    [ 4, false ],
    [ 5, true ],
    [ 6, false ],
    [ 7, false ],
    [ Number.MAX_SAFE_INTEGER, false ],
  ];

  for (const [ height, value ] of validCases) {
    it(`returns value ${value} at ${height}`, () => {
      expect(series.query.get(height)).toBe(value);
    });
  }

  for (const height of [ 6, 5, 0 ]) {
    it(`rejects already set height ${height}`, () => {
      expect(() => {
        return series.apply.set(height, true);
      }).toThrowError('already set');
    });
  }

  for (const height of [ 7, Number.MAX_SAFE_INTEGER ]) {
    it(`accepts new point at height ${height}`, () => {
      series.apply.set(height, true);
      expect(series.query.get(height)).toBeTruthy();
    });
  }
});
