import { IAction } from '../action';

/* eslint @typescript-eslint/require-await: 0 */
const run = async(): Promise<void> => {
  throw new Error('not implemented yet');
};

const Key: IAction = {
  id: 'key',
  run,
};

export { Key };
