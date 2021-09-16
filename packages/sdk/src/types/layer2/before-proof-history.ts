import * as Sdk from '../sdk';

// txid === undefined is possible to not break backward compatibility in Morpheus v1 API
export interface IBeforeProofHistory {
  contentId: Sdk.ContentId;
  existsFromHeight: number | null;
  txid?: Sdk.TransactionId | null;
  queriedAtHeight: number;
}
