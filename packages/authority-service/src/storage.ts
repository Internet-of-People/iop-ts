import { AuthorityAPI, IO, JsonUtils } from '@internet-of-people/sdk';

export interface IRequestData {
  capabilityLink: AuthorityAPI.CapabilityLink;
  requestId: IO.ContentId; // ISigned<IWitnessRequest> private blob
  dateOfRequest: IO.DateTime;
  status: AuthorityAPI.Status;
  processId: IO.ContentId; // IProcess public blob
  statementId: IO.ContentId | null; // ISigned<IWitnessStatement> private blob
  rejectionReason: string | null;
  notes: string | null;
  // lockedBy: KeyLink | null;
}

export interface IStorage {
  getProcesses(): Promise<IO.ContentId[]>;

  getPublicBlob(contentId: IO.ContentId): Promise<unknown | null>; // Process, schema downloads
  setPublicBlob(contentId: IO.ContentId, content: unknown): Promise<void>;

  getPrivateBlob(contentId: IO.ContentId): Promise<unknown | null>; // ISigned<IWitnessRequest> download
  setPrivateBlob(contentId: IO.ContentId, content: unknown): Promise<void>;

  getRequests(): Promise<IRequestData[]>; // TODO paging
  getRequestByLink(capabilityLink: AuthorityAPI.CapabilityLink): Promise<IRequestData | null>;
  getRequestById(requestId: IO.ContentId): Promise<IRequestData | null>;
  updateRequest(request: IRequestData): Promise<void>;
  createRequest(request: IRequestData): Promise<void>;
}

export const addPublicBlob = async(s: IStorage, c: IO.IContent): Promise<IO.ContentId> => {
  const contentId = JsonUtils.digest(c);
  await s.setPublicBlob(contentId, c);
  return contentId;
};

export const addProcessSchemas = async(s: IStorage, p: IO.IProcess): Promise<IO.ContentId> => {
  const contentId = JsonUtils.digest(p);

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
