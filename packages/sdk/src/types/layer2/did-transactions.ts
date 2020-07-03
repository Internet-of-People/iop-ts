import { Did } from '@internet-of-people/morpheus-crypto';
import { IState } from './state';
import { TransactionId } from '../sdk';

export interface ITransactionIdHeight {
  transactionId: TransactionId;
  height: number;
}

export interface IDidTransactionsQueries {
  getBetween(did: Did, fromHeightIncl: number, untilHeightIncl?: number): ITransactionIdHeight[];
}

export interface IDidTransactionsOperations {
  registerOperationAttempt(height: number, did: Did, transactionId: TransactionId): void;
}

export type IDidTransactionsState = IState<IDidTransactionsQueries, IDidTransactionsOperations>;
