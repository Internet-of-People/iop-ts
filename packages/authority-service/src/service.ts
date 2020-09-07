import moment from 'moment';
import { Authority, Crypto, Signed, Types } from '@internet-of-people/sdk';
import { IStorage, IRequestData } from './storage';

export class Service implements Types.Authority.IApi {
  public constructor(private readonly storage: IStorage) {
  }

  public async listProcesses(): Promise<Types.Sdk.ContentId[]> {
    return this.storage.getProcesses();
  }

  public async getPublicBlob(contentId: Types.Sdk.ContentId): Promise<unknown> {
    const content = await this.storage.getPublicBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown contentId '${contentId}'`);
  }

  public async sendRequest(
    witnessRequest: Types.Sdk.ISigned<Types.Sdk.IWitnessRequest>,
  ): Promise<Types.Authority.CapabilityLink> {
    const requestId = Crypto.digestJson(witnessRequest);

    const existingRequestData = await this.storage.getRequestById(requestId);

    if (existingRequestData) {
      console.log(`Signed witness request ${requestId} already existed`);
      return existingRequestData.capabilityLink;
    }

    const model = new Signed(witnessRequest, 'witness request');

    if (!model.checkSignature()) {
      throw Error(`Signed witness request ${requestId} has invalid signature`);
    }
    await this.storage.setPrivateBlob(requestId, witnessRequest);

    const capabilityLink = Crypto.nonce264();
    const data: IRequestData = {
      capabilityLink,
      requestId,
      dateOfRequest: moment.utc().toISOString(),
      status: Authority.Status.Pending,
      processId: model.payloadObject.processId,
      notes: null,
      statementId: null,
      rejectionReason: null,
    };
    await this.storage.createRequest(data);
    console.log(`Signed witness request ${requestId} succesfully uploaded as ${capabilityLink}`);
    return capabilityLink;
  }

  public async getRequestStatus(
    capabilityLink: Types.Authority.CapabilityLink,
  ): Promise<Types.Authority.IRequestStatus> {
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    const status: Types.Authority.IRequestStatus = {
      status: data.status,
      signedStatement: null,
      rejectionReason: data.rejectionReason,
    };

    if (data.statementId) {
      status.signedStatement = await this.storage.getPrivateBlob(
        data.statementId,
      ) as Types.Sdk.ISigned<Types.Sdk.IWitnessStatement>;
    }
    return status;
  }

  public async listRequests(_clerkPk: string): Promise<Types.Authority.IRequestEntry[]> {
    // TODO authenticate in middleware
    const datas = await this.storage.getRequests();
    return datas.map((data) => {
      const entry: Types.Authority.IRequestEntry = {
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

  public async getPrivateBlob(_clerkPk: string, contentId: Types.Sdk.ContentId): Promise<unknown> {
    // TODO authenticate in middleware
    const content = await this.storage.getPrivateBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown private contentId '${contentId}'`);
  }

  public async approveRequest(
    _clerkPk: string,
    capabilityLink: Types.Authority.CapabilityLink,
    signedStatement: Types.Sdk.ISigned<Types.Sdk.IWitnessStatement>,
  ): Promise<void> {
    // TODO authenticate in middleware
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    if (data.status !== Authority.Status.Pending) {
      throw new Error(`Request '${data.requestId}' cannot be approved in state ${data.status}`);
    }

    const model = new Signed(signedStatement, 'witness statement');
    const statementId = model.contentId;

    if (!model.checkSignature()) {
      throw Error(`Signed presentation ${statementId} has invalid signature`);
    }

    await this.storage.setPrivateBlob(statementId, signedStatement);
    data.status = Authority.Status.Approved;
    data.statementId = statementId;
    data.rejectionReason = null;
    return this.storage.updateRequest(data);
  }

  public async rejectRequest(
    _clerkPk: string,
    capabilityLink: Types.Authority.CapabilityLink,
    rejectionReason: string,
  ): Promise<void> {
    // TODO authenticate in middleware
    const data = await this.storage.getRequestByLink(capabilityLink);

    if (data === null) {
      throw new Error(`Unknown capabilityLink '${capabilityLink}'`);
    }

    if (data.status !== Authority.Status.Pending) {
      throw new Error(`Request '${data.requestId}' cannot be rejected in state ${data.status}`);
    }

    if (typeof rejectionReason !== 'string') {
      throw new Error(`Rejection reason '${rejectionReason}' is not a string`);
    }
    data.status = Authority.Status.Rejected;
    data.statementId = null;
    data.rejectionReason = rejectionReason;
    return this.storage.updateRequest(data);
  }
}
