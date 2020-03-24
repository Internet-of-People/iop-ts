import cloneDeep from 'lodash.clonedeep';
import Optional from 'optional-js';

import { IO } from '@internet-of-people/sdk';
type Did = IO.Did;
type DidData = IO.DidData;
type TransactionId = IO.TransactionId;

import {
  IDidTransactionsOperations,
  IDidTransactionsQueries,
  IDidTransactionsState,
  ITransactionIdHeight,
} from '../../../interfaces';
import { isHeightInRange } from './state';


export class DidTransactionsState implements IDidTransactionsState {
  public readonly query: IDidTransactionsQueries = {
    getBetween: (did: Did, fromHeightInc: number, untilHeightExc?: number): ITransactionIdHeight[] => {
      const transactions = this.getOrCreateDidTransactionEntries(did);
      const entriesInRange = transactions.filter((entry) => {
        return isHeightInRange(entry.height,
          Optional.of(fromHeightInc), Optional.ofNullable(untilHeightExc));
      });
      return entriesInRange;
    },
  };

  public readonly apply: IDidTransactionsOperations = {
    registerOperationAttempt: (height: number, did: Did, transactionId: TransactionId): void => {
      const transactions = this.getOrCreateDidTransactionEntries(did);

      if (transactions.findIndex((entry) => {
        return entry.transactionId === transactionId;
      }) < 0) {
        // TODO keep invariant that transactions are ordered by height
        transactions.unshift({ transactionId, height });
      }
    },
  };

  public readonly revert: IDidTransactionsOperations = {
    registerOperationAttempt: (_height: number, did: Did, transactionId: TransactionId): void => {
      const transactions = this.getOrCreateDidTransactionEntries(did);
      const index = transactions.findIndex((entry) => {
        return entry.transactionId === transactionId;
      });

      if (index >= 0) {
        transactions.splice(index, 1);
      } else {
        // NOTE A transaction might include multiple operations related to a single Did.
        //      Reverting the first operation attempt already removed the transactionId
        //      from the array, we are likely processing the next related operation here
      }
    },
  };

  private readonly didTransactions: Map<DidData, ITransactionIdHeight[]>;

  public constructor(didTransactions?: Map<DidData, ITransactionIdHeight[]>) {
    this.didTransactions = didTransactions ?? new Map();
  }

  public clone(): IDidTransactionsState {
    const clonedDidTransactions = new Map<DidData, ITransactionIdHeight[]>();

    for (const [ key, value ] of this.didTransactions.entries()) {
      clonedDidTransactions.set(key, cloneDeep(value));
    }
    return new DidTransactionsState(clonedDidTransactions);
  }


  private getOrCreateDidTransactionEntries(did: Did): ITransactionIdHeight[] {
    const didData = did.toString();
    let transactionEntries = this.didTransactions.get(didData);

    /* eslint no-undefined: 0 */
    if (transactionEntries === undefined) {
      transactionEntries = [];
      this.didTransactions.set(didData, transactionEntries);
    }
    return transactionEntries;
  }
}
