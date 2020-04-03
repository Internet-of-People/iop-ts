import { Crypto, Types } from '@internet-of-people/sdk';
import { IState } from './state';

export interface ITransactionIdHeight {
  transactionId: Types.Sdk.TransactionId;
  height: number;
}

export interface IDidTransactionsQueries {
  getBetween(did: Crypto.Did, fromHeightIncl: number, untilHeightIncl?: number): ITransactionIdHeight[];
}

export interface IDidTransactionsOperations {
  registerOperationAttempt(height: number, did: Crypto.Did, transactionId: Types.Sdk.TransactionId): void;
}

export type IDidTransactionsState = IState<IDidTransactionsQueries, IDidTransactionsOperations>;
