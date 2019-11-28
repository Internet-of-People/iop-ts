import { TimeSeries } from "./time-series";

describe('empty series', () => {
  let series: TimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
  });

  it('returns initial value for valid heights', () => {
    let seriesInitiallyFalse = new TimeSeries(false);
    expect(seriesInitiallyFalse.get(0)).toBeFalsy();

    let seriesInitiallyTrue = new TimeSeries(true);
    expect(seriesInitiallyTrue.get(0)).toBeTruthy();
  });

  for (const height of [0, 5, Number.MAX_SAFE_INTEGER]) {
    it(`set accepts valid height ${height}`, () => {
      series.set(height, true);
      expect(series.get(height)).toBeTruthy();
    });
  }

  for (const height of [Number.MIN_VALUE, 5.1, -1, Number.MAX_VALUE]) {
    it(`set rejects invalid height ${height}`, () => {
      expect(() => series.set(height, true)).toThrowError('must be a non-negative integer');
    });
  }

  it('rejects unset', () => {
    expect(() => series.unset(1, false)).toThrowError('nothing to unset')
  });
});

describe('single entry series', () => {
  let series: TimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
    series.set(5, true);
  });

  it('rejects unset with not matching height', () => {
    expect(() => series.unset(4, true)).toThrowError('was set at a different height');
  })

  it('rejects unset with not matching value', () => {
    expect(() => series.unset(5, false)).toThrowError('was set to a different value');
  })

  it('accepts matching unset', () => {
    series.unset(5, true);
    expect(series.get(5)).toBeFalsy();
  })

  const validCases: [number, boolean][] = [[0, false],[4, false],[5, true],[Number.MAX_SAFE_INTEGER, true]];
  for (const [height, value]  of validCases) {
    it(`returns value ${value} at ${height}`, () => {
      expect(series.get(height)).toBe(value);
    })
  }

  it('get rejects invalid height', () => {
    expect(() => series.get(-1)).toThrowError('non-negative');
    expect(() => series.get(0.1)).toThrowError('integer');
  })

  for (const height of [5, 4, 0]) {
    it(`rejects already set height ${height}`, () => {
      expect(() => series.set(height, true)).toThrowError('already set');
    })
  }

  for (const height of [6, Number.MAX_SAFE_INTEGER]) {
    it(`accepts new point at height ${height}`, () => {
      series.set(height, true);
      expect(series.get(height)).toBeTruthy();
    })
  }
});

describe('multiple entry series', () => {
  let series: TimeSeries;
  beforeEach(() => {
    series = new TimeSeries(false);
    series.set(5, true);
    series.set(6, false);
  });

  it('rejects unset with not matching height', () => {
    expect(() => series.unset(5, false)).toThrowError('was set at a different height');
  })

  it('rejects unset with not matching value', () => {
    expect(() => series.unset(6, true)).toThrowError('was set to a different value');
  })

  it('accepts matching unset', () => {
    series.unset(6, false);
    expect(series.get(6)).toBeTruthy();
  })

  it('accepts multiple matching unsets', () => {
    series.unset(6, false);
    series.unset(5, true);
    expect(series.get(6)).toBeFalsy();
  })

  const validCases: [number, boolean][] = [[0, false],[4, false],[5, true],[6, false],[7, false],[Number.MAX_SAFE_INTEGER, false]];
  for (const [height, value]  of validCases) {
    it(`returns value ${value} at ${height}`, () => {
      expect(series.get(height)).toBe(value);
    })
  }

  for (const height of [6, 5, 0]) {
    it(`rejects already set height ${height}`, () => {
      expect(() => series.set(height, true)).toThrowError('already set');
    })
  }

  for (const height of [7, Number.MAX_SAFE_INTEGER]) {
    it(`accepts new point at height ${height}`, () => {
      series.set(height, true);
      expect(series.get(height)).toBeTruthy();
    })
  }

});
