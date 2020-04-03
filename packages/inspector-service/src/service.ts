import { Crypto, Types, JsonUtils, Signed } from '@internet-of-people/sdk';

import { IStorage } from './storage';
import { IHydraApi } from './hydra-api';

export class Service implements Types.Inspector.IApi {
  public constructor(private readonly storage: IStorage, private readonly hydra: IHydraApi) {
  }

  public async listScenarios(): Promise<Types.Sdk.ContentId[]> {
    return this.storage.getScenarios();
  }

  public async getPublicBlob(contentId: Types.Sdk.ContentId): Promise<unknown> {
    const content = await this.storage.getPublicBlob(contentId);

    if (content) {
      return content;
    }
    throw new Error(`Unknown contentId '${contentId}'`);
  }

  public async uploadPresentation(
    presentation: Types.Sdk.ISigned<Types.Sdk.IPresentation>,
  ): Promise<Types.Sdk.ContentId> {
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

  public async getAfterProof(): Promise<Types.Sdk.IAfterProof> {
    const afterProof = await this.hydra.getBlockIdAtHeight();

    if (!afterProof) {
      throw new Error('Could not get block height or hash from Hydra');
    }
    return afterProof;
  }

  public async validate(request: Types.Verifier.IValidationRequest): Promise<Types.Verifier.IValidationResult> {
    const result: Types.Verifier.IValidationResult = {
      errors: [],
      warnings: [],
    };

    try {
      const did = new Crypto.Did(request.onBehalfOf);
      const doc = await this.hydra.getDidDocument(did);
      const pk = new Crypto.PublicKey(request.publicKey);
      const validator = new Crypto.SignedJson(
        pk,
        request.contentId,
        new Crypto.Signature(request.signature),
      );
      const validationRes: Crypto.ValidationResult = validator.validateWithDidDoc(
        JSON.stringify(doc.toData()),
        await this.fromHeight(request.afterProof),
        await this.untilHeight(request.contentId),
      );

      for (const i of validationRes.messages) {
        const issue: Crypto.ValidationIssue = i;
        const message = `${issue.reason} (${issue.code})`;

        if (issue.severity === 'ERROR') {
          result.errors.push(message);
        } else {
          result.warnings.push(message);
        }
      }
    } catch (error) {
      result.errors.push(error.toString());
    }
    return result;
  }

  private async fromHeight(afterProof: Types.Sdk.IAfterProof | null): Promise<number | undefined> {
    if (afterProof) {
      const block = await this.hydra.getBlockIdAtHeight(afterProof.blockHeight);

      if (block && block.blockHash === afterProof.blockHash) {
        return block.blockHeight;
      }
    }
    /* eslint no-undefined:0 */
    return undefined;
  }

  private async untilHeight(contentId: string): Promise<number | undefined> {
    const beforeProofHistory: Types.Layer2.IBeforeProofHistory = await this.hydra.getBeforeProofHistory(contentId);

    if (beforeProofHistory.existsFromHeight) {
      return beforeProofHistory.existsFromHeight;
    }
    /* eslint no-undefined:0 */
    return undefined;
  }
}
