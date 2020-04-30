import Optional from 'optional-js';
import * as Crypto from '@internet-of-people/morpheus-crypto';
import * as Types from '../../types';

export interface IApi {
  getBeforeProofHistory(contentId: string): Promise<Types.Layer2.IBeforeProofHistory>;
  beforeProofExists(contentId: string, height?: number): Promise<boolean>;
  getDidDocument(did: Crypto.Did, height?: number): Promise<Types.Layer2.IDidDocument>;
  getTxnStatus(morpheusTxId: Types.Sdk.TransactionId): Promise<Optional<boolean>>;
  getLastTxId(did: Crypto.Did): Promise<Types.Sdk.TransactionId | null>;
}
