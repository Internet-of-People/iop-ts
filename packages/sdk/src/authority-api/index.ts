import { ISigned, IWitnessStatement, ContentId, DateTime, IWitnessRequest } from '../interfaces/io';

export type CapabilityLink = string; // Example "uFoobar"

export enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface IRequestStatus {
  status: Status;
  signedStatement: ISigned<IWitnessStatement> | null;
  rejectionReason: string | null;
}

export interface IRequestEntry {
  capabilityLink: CapabilityLink;
  requestId: ContentId; // ISigned<IWitnessRequest>
  dateOfRequest: DateTime;
  status: Status;
  processId: ContentId; // IProcess
  notes: string | null;
  // lockedBy: KeyLink;
}

export interface IPublicApi {
  listProcesses(): Promise<ContentId[]>;
  getPublicBlob(contentId: ContentId): Promise<unknown>; // Process, schema downloads
  sendRequest(witnessRequest: ISigned<IWitnessRequest>): Promise<CapabilityLink>;
  getRequestStatus(capabilityLink: CapabilityLink): Promise<IRequestStatus>;
}

export interface IPrivateApi {
  listRequests(): Promise<IRequestEntry[]>;
  getPrivateBlob(contentId: ContentId): Promise<unknown>; // ISigned<IWitnessRequest> download
  approveRequest(capabilityLink: CapabilityLink, signedStatement: ISigned<IWitnessStatement>): Promise<void>;
  rejectRequest(capabilityLink: CapabilityLink, rejectionReason: string): Promise<void>;
}

export interface IApi extends IPublicApi, IPrivateApi {}
