import { Database } from '@arkecosystem/core-interfaces';
import { TransactionReader } from '@arkecosystem/core-transactions';
import { Transactions } from '@arkecosystem/crypto';

export interface ITransactionReader {
  hasNext(): boolean;
  read(): Promise<Database.IBootstrapTransaction[]>;
}

export type TransactionReaderFactory = (
  connection: Database.IConnection,
  constructor: typeof Transactions.Transaction,
) => Promise<ITransactionReader>;

export const READER_FACTORY_COMPONENT_NAME = 'hydra-transaction-reader-factory';

export const transactionReaderFactory: TransactionReaderFactory = async(connection, constructor) => {
  return TransactionReader.create(connection, constructor);
};
