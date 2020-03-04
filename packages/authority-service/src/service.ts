import moment from 'moment';
import { AuthorityAPI, IO, JsonUtils, Utils } from '@internet-of-people/sdk';
import { IStorage, IRequestData } from './storage';

export class Service implements AuthorityAPI.IApi {
  public constructor(private readonly storage: IStorage) {
  }

  public async listProcesses(): Promise<IO.ContentId[]> {
    return this.storage.getProcesses();
  }

  public async getPublicBlob(contentId: IO.ContentId): Promise<unknown> {
    const content = await this.storage.getPublicBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown contentId '${contentId}'`);
  }

  public async sendRequest(witnessRequest: IO.ISigned<IO.IWitnessRequest>): Promise<AuthorityAPI.CapabilityLink> {
    const requestId = JsonUtils.digest(witnessRequest);

    const existingRequestData = await this.storage.getRequestById(requestId);

    if (existingRequestData) {
      return existingRequestData.capabilityLink;
    }

    if (witnessRequest.content === null || typeof witnessRequest.content !== 'object') {
      throw new Error('Signed witness request is missing its content!');
    }

    await this.storage.setPrivateBlob(requestId, witnessRequest);

    const capabilityLink = Utils.nonce264();
    const data: IRequestData = {
      capabilityLink,
      requestId,
      dateOfRequest: moment.utc().toISOString(),
      status: AuthorityAPI.Status.Pending,
      processId: witnessRequest.content.processId,
      notes: null,
      statementId: null,
      rejectionReason: null,
    };
    await this.storage.createRequest(data);
    return capabilityLink;
  }

  public async getRequestStatus(capabilityLink: AuthorityAPI.CapabilityLink): Promise<AuthorityAPI.IRequestStatus> {
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    const status: AuthorityAPI.IRequestStatus = {
      status: data.status,
      signedStatement: null,
      rejectionReason: data.rejectionReason,
    };

    if (data.statementId) {
      status.signedStatement = await this.storage.getPrivateBlob(data.statementId) as IO.ISigned<IO.IWitnessStatement>;
    }
    return status;
  }

  public async listRequests(): Promise<AuthorityAPI.IRequestEntry[]> {
    // TODO authenticate in middleware
    const datas = await this.storage.getRequests();
    return datas.map((data) => {
      const entry: AuthorityAPI.IRequestEntry = {
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

  public async getPrivateBlob(contentId: IO.ContentId): Promise<unknown> {
    // TODO authenticate in middleware
    const content = await this.storage.getPrivateBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown private contentId '${contentId}'`);
  }

  public async approveRequest(
    capabilityLink: AuthorityAPI.CapabilityLink,
    signedStatement: IO.ISigned<IO.IWitnessStatement>,
  ): Promise<void> {
    // TODO authenticate in middleware
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    if (data.status !== AuthorityAPI.Status.Pending) {
      throw new Error(`Request '${data.requestId}' cannot be approved in state ${data.status}`);
    }
    const statementId = JsonUtils.digest(signedStatement);
    await this.storage.setPrivateBlob(statementId, signedStatement);
    data.status = AuthorityAPI.Status.Approved;
    data.statementId = statementId;
    data.rejectionReason = null;
    return this.storage.updateRequest(data);
  }

  public async rejectRequest(capabilityLink: AuthorityAPI.CapabilityLink, rejectionReason: string): Promise<void> {
    // TODO authenticate in middleware
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    if (data.status !== AuthorityAPI.Status.Pending) {
      throw new Error(`Request '${data.requestId}' cannot be rejected in state ${data.status}`);
    }

    if (typeof rejectionReason !== 'string') {
      throw new Error(`Rejection reason '${rejectionReason}' is not a string`);
    }
    data.status = AuthorityAPI.Status.Rejected;
    data.statementId = null;
    data.rejectionReason = rejectionReason;
    return this.storage.updateRequest(data);
  }
}
