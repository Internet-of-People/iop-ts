import { InspectorAPI, VerifierAPI, IO, JsonUtils, Signed } from '@internet-of-people/sdk';

import { IStorage } from './storage';
import { IHydraApi } from './hydra-api';

export class Service implements InspectorAPI.IApi {
  public constructor(private readonly storage: IStorage, private readonly hydra: IHydraApi) {
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
      console.log(`Signed presentation ${contentId} already existed`);
      return contentId;
    }

    const model = new Signed(presentation, 'presentation');

    if (!model.checkSignature()) {
      throw Error(`Signed presentation ${contentId} has invalid signature`);
    }
    // TODO add the checks that need some lookups on the blockchain before reporting success

    await this.storage.setPublicBlob(contentId, presentation);
    console.log(`Signed presentation ${contentId} succesfully uploaded`);
    return contentId;
  }

  public async getAfterProof(): Promise<IO.IAfterProof> {
    const afterProof = await this.hydra.getBlockIdAtHeight();

    if (!afterProof) {
      throw new Error('Could not get block height or hash from Hydra');
    }
    return afterProof;
  }

  public async validate(_request: VerifierAPI.IValidationRequest): Promise<VerifierAPI.IValidationResult> {
    return {
      errors: [],
      warnings: ['Validation not implemented yet'],
    };
  }
}
