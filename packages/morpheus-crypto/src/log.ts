const consoleLog = (...vargs: unknown[]): void => {
  return console.log(vargs);
};

const logNothing = (..._: unknown[]): void => {
  /* do nothing here */
};

export let log = logNothing;

export const disable = (): void => {
  log = logNothing;
};

export const enable = (): void => {
  log = consoleLog;
};
