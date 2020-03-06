import { ISigned, ContentId, IPresentation } from '../interfaces/io';

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
  listScenarios(): Promise<ContentId[]>;
  // listRecommendedAuthorities(): Promise<IAuthorityRecommendation>;
  // listBannedAuthorities(): Promise<IBannedAuthority>;
  getPublicBlob(contentId: ContentId): Promise<unknown>; // scenarios, schema downloads
  uploadPresentation(presentation: ISigned<IPresentation>): Promise<ContentId>;
}

export interface IPrivateApi {
  getPublicBlob(contentId: ContentId): Promise<unknown>; // presentation downloads
  // verifySignature(): Promise<any>;
}

export interface IApi extends IPublicApi, IPrivateApi {}
