import { Authority, Crypto, Types } from '@internet-of-people/sdk';

export interface IRequestData {
  capabilityLink: Types.Authority.CapabilityLink;
  requestId: Types.Sdk.ContentId; // ISigned<IWitnessRequest> private blob
  dateOfRequest: Types.Sdk.DateTime;
  status: Authority.Status;
  processId: Types.Sdk.ContentId; // IProcess public blob
  statementId: Types.Sdk.ContentId | null; // ISigned<IWitnessStatement> private blob
  rejectionReason: string | null;
  notes: string | null;
  // lockedBy: KeyLink | null;
}

export interface IStorage {
  getProcesses(): Promise<Types.Sdk.ContentId[]>;

  getPublicBlob(contentId: Types.Sdk.ContentId): Promise<unknown | null>; // Process, schema downloads
  setPublicBlob(contentId: Types.Sdk.ContentId, content: unknown): Promise<void>;

  getPrivateBlob(contentId: Types.Sdk.ContentId): Promise<unknown | null>; // ISigned<IWitnessRequest> download
  setPrivateBlob(contentId: Types.Sdk.ContentId, content: unknown): Promise<void>;

  getRequests(): Promise<IRequestData[]>; // TODO paging
  getRequestByLink(capabilityLink: Types.Authority.CapabilityLink): Promise<IRequestData | null>;
  getRequestById(requestId: Types.Sdk.ContentId): Promise<IRequestData | null>;
  updateRequest(request: IRequestData): Promise<void>;
  createRequest(request: IRequestData): Promise<void>;
}

export const addPublicBlob = async(s: IStorage, c: Types.Sdk.IContent): Promise<Types.Sdk.ContentId> => {
  const contentId = Crypto.digestJson(c);
  await s.setPublicBlob(contentId, c);
  return contentId;
};

export const addProcessSchemas = async(s: IStorage, p: Types.Sdk.IProcess): Promise<Types.Sdk.ContentId> => {
  const contentId = Crypto.digestJson(p);

  /* eslint require-atomic-updates: 0 */
  const { claimSchema, evidenceSchema, constraintsSchema } = p;

  if (typeof claimSchema === 'object') {
    const claimSchemaContentId = await addPublicBlob(s, claimSchema);
    p.claimSchema = claimSchemaContentId;
  }

  if (evidenceSchema !== null && typeof evidenceSchema === 'object') {
    const evidenceSchemaContentId = await addPublicBlob(s, evidenceSchema);
    p.evidenceSchema = evidenceSchemaContentId;
  }

  if (constraintsSchema !== null && typeof constraintsSchema === 'object') {
    const constraintsSchemaContentId = await addPublicBlob(s, constraintsSchema);
    p.constraintsSchema = constraintsSchemaContentId;
  }

  const contentId2 = await addPublicBlob(s, p);

  if (contentId2 !== contentId) {
    throw new Error(
      `jsonDigest changed on process ${p.name} after schemas were collapsed.
      ${contentId2}!==${contentId}`,
    );
  }
  return contentId;
};
