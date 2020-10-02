import { Interfaces as CryptoIf } from '@arkecosystem/crypto';

export interface ICoeusData extends CryptoIf.ITransactionData {
  asset: ICoeusAsset;
}

export interface ICoeusAsset {
  operationAttempts: null; // TODO
}
