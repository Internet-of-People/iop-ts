import * as Sdk from './sdk';
import * as Verifier from './verifier';

// export interface IAuthorityRecommendation {
//   did: Did;
//   endpoint: string;
//   processes: ContentId[];
// }

// export interface IBannedAuthority {
//   did: Did;
//   reason: string;
// }


export interface IPublicApi {
  listScenarios(): Promise<Sdk.ContentId[]>;
  // listRecommendedAuthorities(): Promise<IAuthorityRecommendation>;
  // listBannedAuthorities(): Promise<IBannedAuthority>;
  getPublicBlob(contentId: Sdk.ContentId): Promise<unknown>; // scenarios, schema downloads
  uploadPresentation(presentation: Sdk.ISigned<Sdk.IPresentation>): Promise<Sdk.ContentId>;
}

export interface IPrivateApi {
  getPublicBlob(contentId: Sdk.ContentId): Promise<unknown>; // presentation downloads
}

export interface IApi extends IPublicApi, IPrivateApi, Verifier.IVerifierApi {}
