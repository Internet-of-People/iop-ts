import moment from 'moment';

import {
  ContentId,
  ISigned,
  IWitnessRequest,
  jsonDigest,
  nonce264,
  IWitnessStatement,
} from './sdk';
import {
  CapabilityLink,
  IApi,
  IRequestEntry,
  IRequestStatus,
  Status,
} from './api';
import { IStorage, IRequestData } from './storage';

export class Service implements IApi {
  public constructor(private readonly storage: IStorage) {
  }

  public async listProcesses(): Promise<ContentId[]> {
    return this.storage.getProcesses();
  }

  public async getPublicBlob(contentId: ContentId): Promise<unknown> {
    const content = await this.storage.getPublicBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown contentId '${contentId}'`);
  }

  public async sendRequest(witnessRequest: ISigned<IWitnessRequest>): Promise<CapabilityLink> {
    const requestId = jsonDigest(witnessRequest);

    const existingRequestData = await this.storage.getRequestById(requestId);

    if (existingRequestData) {
      return existingRequestData.capabilityLink;
    }

    if (witnessRequest.content === null || typeof witnessRequest.content !== 'object') {
      throw new Error('Signed witness request is missing its content!');
    }

    await this.storage.setPrivateBlob(requestId, witnessRequest);

    const capabilityLink = nonce264();
    const data: IRequestData = {
      capabilityLink,
      requestId,
      dateOfRequest: moment.utc().toISOString(),
      status: Status.Pending,
      processId: witnessRequest.content.processId,
      notes: null,
      statementId: null,
      rejectionReason: null,
    };
    await this.storage.createRequest(data);
    return capabilityLink;
  }

  public async getRequestStatus(capabilityLink: CapabilityLink): Promise<IRequestStatus> {
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    const status: IRequestStatus = {
      status: data.status,
      signedStatement: null,
      rejectionReason: data.rejectionReason,
    };

    if (data.statementId) {
      status.signedStatement = await this.storage.getPrivateBlob(data.statementId) as ISigned<IWitnessStatement>;
    }
    return status;
  }

  public async listRequests(): Promise<IRequestEntry[]> {
    // TODO authenticate in middleware
    const datas = await this.storage.getRequests();
    return datas.map((data) => {
      const entry: IRequestEntry = {
        capabilityLink: data.capabilityLink,
        requestId: data.requestId,
        dateOfRequest: data.dateOfRequest,
        status: data.status,
        processId: data.processId,
        notes: data.notes,
      };
      return entry;
    });
  }

  public async getPrivateBlob(contentId: ContentId): Promise<unknown> {
    // TODO authenticate in middleware
    const content = await this.storage.getPrivateBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown private contentId '${contentId}'`);
  }

  public async approveRequest(
    capabilityLink: CapabilityLink,
    signedStatement: ISigned<IWitnessStatement>,
  ): Promise<void> {
    // TODO authenticate in middleware
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    if (data.status !== Status.Pending) {
      throw new Error(`Request '${data.requestId}' cannot be approved in state ${data.status}`);
    }
    const statementId = jsonDigest(signedStatement);
    await this.storage.setPrivateBlob(statementId, signedStatement);
    data.status = Status.Approved;
    data.statementId = statementId;
    data.rejectionReason = null;
    return this.storage.updateRequest(data);
  }

  public async rejectRequest(capabilityLink: CapabilityLink, rejectionReason: string): Promise<void> {
    // TODO authenticate in middleware
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    if (data.status !== Status.Pending) {
      throw new Error(`Request '${data.requestId}' cannot be rejected in state ${data.status}`);
    }

    if (typeof rejectionReason !== 'string') {
      throw new Error(`Rejection reason '${rejectionReason}' is not a string`);
    }
    data.status = Status.Rejected;
    data.statementId = null;
    data.rejectionReason = rejectionReason;
    return this.storage.updateRequest(data);
  }
}
