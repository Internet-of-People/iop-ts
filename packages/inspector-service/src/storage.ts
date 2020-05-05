import { Crypto, Types } from '@internet-of-people/sdk';

export interface IStorage {
  getScenarios(): Promise<Types.Sdk.ContentId[]>;

  getPublicBlob(contentId: Types.Sdk.ContentId): Promise<unknown | null>;
  setPublicBlob(contentId: Types.Sdk.ContentId, content: unknown): Promise<void>;
}

export const addPublicBlob = async(storage: IStorage, content: Types.Sdk.IContent): Promise<Types.Sdk.ContentId> => {
  const contentId = Crypto.digest(content);
  await storage.setPublicBlob(contentId, content);
  return contentId;
};

export const addScenario = async(storage: IStorage, scenario: Types.Sdk.IScenario): Promise<Types.Sdk.ContentId> => {
  const contentId = Crypto.digest(scenario);

  scenario.prerequisites = await Promise.all(scenario.prerequisites.map(async(prerequisite) => {
    const result = prerequisite;

    if (typeof prerequisite.process === 'object') {
      result.process = await addPublicBlob(storage, prerequisite.process);
    }
    return result;
  }));

  /* eslint require-atomic-updates: 0 */
  const { resultSchema } = scenario;

  if (resultSchema !== null && typeof resultSchema === 'object') {
    const resultSchemaContentId = await addPublicBlob(storage, resultSchema);
    scenario.resultSchema = resultSchemaContentId;
  }

  const contentId2 = await addPublicBlob(storage, scenario);

  if (contentId2 !== contentId) {
    throw new Error(
      `jsonDigest changed on scenario ${scenario.name} after schemas were collapsed.
      ${contentId2}!==${contentId}`,
    );
  }
  return contentId;
};
