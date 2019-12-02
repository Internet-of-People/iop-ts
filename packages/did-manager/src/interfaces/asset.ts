import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { OperationData } from '../morpheus-transaction/operations';

export interface IMorpheusData extends CryptoIf.ITransactionData {
  asset: IMorpheusAsset;
}

export interface IMorpheusAsset {
  operationAttempts: OperationData.IOperationData[];
}
