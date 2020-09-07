import * as Sdk from './sdk';
import { Status } from '../authority';

export type CapabilityLink = string; // Example "uFoobar"

export interface IRequestStatus {
  status: Status;
  signedStatement: Sdk.ISigned<Sdk.IWitnessStatement> | null;
  rejectionReason: string | null;
}

export interface IRequestEntry {
  capabilityLink: CapabilityLink;
  requestId: Sdk.ContentId; // ISigned<IWitnessRequest>
  dateOfRequest: Sdk.DateTime;
  status: Status;
  processId: Sdk.ContentId; // IProcess
  notes: string | null;
  // lockedBy: KeyLink;
}

export interface IPublicApi {
  listProcesses(): Promise<Sdk.ContentId[]>;
  getPublicBlob(contentId: Sdk.ContentId): Promise<unknown>; // Process, schema downloads
  sendRequest(witnessRequest: Sdk.ISigned<Sdk.IWitnessRequest>): Promise<CapabilityLink>;
  getRequestStatus(capabilityLink: CapabilityLink): Promise<IRequestStatus>;
}

export interface IPrivateApi {
  listRequests(
    clerkPk: string,
  ): Promise<IRequestEntry[]>;
  getPrivateBlob(
    clerkPk: string,
    contentId: Sdk.ContentId,
  ): Promise<unknown>; // ISigned<IWitnessRequest> download
  approveRequest(
    clerkPk: string,
    capabilityLink: CapabilityLink,
    signedStatement: Sdk.ISigned<Sdk.IWitnessStatement>,
  ): Promise<void>;
  rejectRequest(
    clerkPk: string,
    capabilityLink: CapabilityLink,
    rejectionReason: string,
  ): Promise<void>;
}

export interface IApi extends IPublicApi, IPrivateApi { }
