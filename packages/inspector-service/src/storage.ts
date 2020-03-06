import { IO, JsonUtils } from '@internet-of-people/sdk';

export interface IStorage {
  getScenarios(): Promise<IO.ContentId[]>;

  getPublicBlob(contentId: IO.ContentId): Promise<unknown | null>;
  setPublicBlob(contentId: IO.ContentId, content: unknown): Promise<void>;
}

export const addPublicBlob = async(storage: IStorage, content: IO.IContent): Promise<IO.ContentId> => {
  const contentId = JsonUtils.digest(content);
  await storage.setPublicBlob(contentId, content);
  return contentId;
};

export const addScenario = async(storage: IStorage, scenario: IO.IScenario): Promise<IO.ContentId> => {
  const contentId = JsonUtils.digest(scenario);

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
