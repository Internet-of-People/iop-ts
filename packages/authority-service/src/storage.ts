import { ContentId, DateTime, IProcess, IContent, jsonDigest } from './sdk';
import { Status, CapabilityLink } from './api';

export interface IRequestData {
  capabilityLink: CapabilityLink;
  requestId: ContentId; // ISigned<IWitnessRequest> private blob
  dateOfRequest: DateTime;
  status: Status;
  processId: ContentId; // IProcess public blob
  statementId: ContentId | null; // ISigned<IWitnessStatement> private blob
  rejectionReason: string | null;
  notes: string | null;
  // lockedBy: KeyLink | null;
}

export interface IStorage {
  getProcesses(): Promise<ContentId[]>;

  getPublicBlob(contentId: ContentId): Promise<unknown | null>; // Process, schema downloads
  setPublicBlob(contentId: ContentId, content: unknown): Promise<void>;

  getPrivateBlob(contentId: ContentId): Promise<unknown | null>; // ISigned<IWitnessRequest> download
  setPrivateBlob(contentId: ContentId, content: unknown): Promise<void>;

  getRequests(): Promise<IRequestData[]>; // TODO paging
  getRequestByLink(capabilityLink: CapabilityLink): Promise<IRequestData | null>;
  getRequestById(requestId: ContentId): Promise<IRequestData | null>;
  updateRequest(request: IRequestData): Promise<void>;
  createRequest(request: IRequestData): Promise<void>;
}

export const addPublicBlob = async(s: IStorage, c: IContent): Promise<ContentId> => {
  const contentId = jsonDigest(c);
  await s.setPublicBlob(contentId, c);
  return contentId;
};

export const addProcessSchemas = async(s: IStorage, p: IProcess): Promise<ContentId> => {
  const contentId = jsonDigest(p);

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
