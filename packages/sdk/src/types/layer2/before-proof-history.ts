import * as Sdk from '../sdk';

export interface IBeforeProofHistory {
  contentId: Sdk.ContentId;
  existsFromHeight: number | null;
  queriedAtHeight: number;
}
