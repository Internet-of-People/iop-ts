import { Interfaces as CryptoIf } from '@arkecosystem/crypto';
import { IOperationData } from './operation-data';

export interface IMorpheusData extends CryptoIf.ITransactionData {
  asset: IMorpheusAsset;
}

export interface IMorpheusAsset {
  operationAttempts: IOperationData[];
}
