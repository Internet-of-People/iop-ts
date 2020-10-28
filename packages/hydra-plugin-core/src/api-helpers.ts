export const safePathInt = (
  pathHeightString: string | undefined | null,
): number | undefined => {
  return Number.isNaN(Number(pathHeightString)) || pathHeightString === '' || pathHeightString === null ?
    /* eslint no-undefined: 0 */
    undefined :
    /* eslint @typescript-eslint/no-non-null-assertion: 0 */
    Number.parseInt(pathHeightString!);
};

export const safePathRange = (
  fromHeight: string | undefined | null,
  untilHeight: string | undefined | null,
): [number, number | undefined] => {
  const fromHeightInc = safePathInt(fromHeight);
  const untilHeightExc = safePathInt(untilHeight);

  if (fromHeightInc === undefined) {
    throw new Error(`Invalid starting block height: ${fromHeightInc}`);
  }
  return [ fromHeightInc, untilHeightExc ];
};
