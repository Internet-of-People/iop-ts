import cloneDeep from 'lodash.clonedeep';
import Optional from 'optional-js';

import {
  Did,
  IDidTransactionsOperations,
  IDidTransactionsQueries,
  IDidTransactionsState,
  TransactionId,
} from '../../../interfaces';
import { isHeightInRange } from './state';


interface IDidTransactionsEntry {
  height: number;
  transactionId: TransactionId;
}

export class DidTransactionsState implements IDidTransactionsState {
  public readonly query: IDidTransactionsQueries = {
    getBetween: (did: Did, fromHeightInc: number, untilHeightExc?: number): TransactionId[] => {
      const transactions = this.getOrCreateDidTransactionEntries(did);
      const entriesInRange = transactions.filter((entry) => {
        return isHeightInRange(entry.height,
          Optional.of(fromHeightInc), Optional.ofNullable(untilHeightExc));
      });
      const result = entriesInRange.map((entry) => {
        return entry.transactionId;
      });
      return result;
    },
  };

  public readonly apply: IDidTransactionsOperations = {
    registerOperationAttempt: (height: number, did: Did, transactionId: TransactionId): void => {
      const transactions = this.getOrCreateDidTransactionEntries(did);

      if (transactions.findIndex((entry) => {
        return entry.transactionId === transactionId;
      }) < 0) {
        // TODO keep invariant that transactions are ordered by height
        transactions.push({ transactionId, height });
      }
    },
  };

  public readonly revert: IDidTransactionsOperations = {
    registerOperationAttempt: (height: number, did: Did, transactionId: TransactionId): void => {
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

  private readonly didTransactions: Map<Did, IDidTransactionsEntry[]>;

  public constructor(didTransactions?: Map<Did, IDidTransactionsEntry[]>) {
    this.didTransactions = didTransactions ?? new Map();
  }

  public clone(): IDidTransactionsState {
    const clonedDidTransactions = new Map<Did, IDidTransactionsEntry[]>();

    for (const [ key, value ] of this.didTransactions.entries()) {
      clonedDidTransactions.set(key, cloneDeep(value));
    }
    return new DidTransactionsState(clonedDidTransactions);
  }


  private getOrCreateDidTransactionEntries(did: Did): IDidTransactionsEntry[] {
    let transactionEntries = this.didTransactions.get(did);

    /* eslint no-undefined: 0 */
    if (transactionEntries === undefined) {
      transactionEntries = new Array<IDidTransactionsEntry>();
      this.didTransactions.set(did, transactionEntries);
    }
    return transactionEntries;
  }
}
