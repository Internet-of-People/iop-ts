import { InspectorAPI, IO, JsonUtils } from '@internet-of-people/sdk';
import { IStorage } from './storage';

export class Service implements InspectorAPI.IApi {
  public constructor(private readonly storage: IStorage) {
  }

  public async listScenarios(): Promise<IO.ContentId[]> {
    return this.storage.getScenarios();
  }

  public async getPublicBlob(contentId: IO.ContentId): Promise<unknown> {
    const content = await this.storage.getPublicBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown contentId '${contentId}'`);
  }

  public async uploadPresentation(presentation: IO.ISigned<IO.IPresentation>): Promise<IO.ContentId> {
    const contentId = JsonUtils.digest(presentation);

    const existingContent = await this.storage.getPublicBlob(contentId);

    if (existingContent) {
      return contentId;
    }

    if (presentation.content === null || typeof presentation.content !== 'object') {
      throw new Error('Signed witness request is missing its content!');
    }

    // TODO add more checks before reporting success

    await this.storage.setPublicBlob(contentId, presentation);
    return contentId;
  }
}
