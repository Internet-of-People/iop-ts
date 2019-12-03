import { IClonable } from './clonable';

export interface IState<IQueries, IOperations> extends IClonable<IState<IQueries, IOperations>> {
  readonly query: IQueries;
  readonly apply: IOperations;
  readonly revert: IOperations;
}
