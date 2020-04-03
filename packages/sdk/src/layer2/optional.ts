import Optional from 'optional-js';

export const isHeightInRangeExclUntil = (
  height: number,
  fromHeightInc: Optional<number>,
  untilHeightExc: Optional<number>,
): boolean => {
  if (fromHeightInc.isPresent() && height < fromHeightInc.get()) {
    return false;
  }

  if (untilHeightExc.isPresent() && height >= untilHeightExc.get()) {
    return false;
  }
  return true;
};

export const isHeightInRangeInclUntil = (
  height: number,
  fromHeightIncl: Optional<number>,
  untilHeightIncl: Optional<number>,
): boolean => {
  return isHeightInRangeExclUntil(height, fromHeightIncl, untilHeightIncl) ||
       untilHeightIncl.isPresent() && height === untilHeightIncl.get() ;
};

export const aggregateOptionals = <T>(
  aggregate: (...presents: T[]) => T,
  ...optionals: Optional<T>[]
): Optional<T> => {
  const presents = optionals.filter((opt) => {
    return opt.isPresent();
  });

  if (presents.length) {
    return Optional.of(aggregate(...presents.map((opt) => {
      return opt.get();
    })));
  } else {
    return Optional.empty();
  }
};
