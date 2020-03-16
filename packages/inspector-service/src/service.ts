import { InspectorAPI, VerifierAPI, IO, JsonUtils, Signed } from '@internet-of-people/sdk';
const { Signature } = IO;
import { Interfaces as DidInterfaces } from '@internet-of-people/did-manager';
type IBeforeProofHistory = DidInterfaces.IBeforeProofHistory;

import { IStorage } from './storage';
import { IHydraApi } from './hydra-api';
import { SignedJson, PublicKey, ValidationResult, ValidationIssue } from '../../morpheus-core/dist';

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

  public async validate(request: VerifierAPI.IValidationRequest): Promise<VerifierAPI.IValidationResult> {
    const result: VerifierAPI.IValidationResult = {
      errors: [],
      warnings: [],
    };

    try {
      const doc = await this.hydra.getDidDocument(request.onBehalfOf);
      const pk = new PublicKey(request.publicKey);
      const validator = new SignedJson(
        pk,
        request.contentId,
        new Signature(request.signature),
      );
      const validationRes: ValidationResult = validator.validateWithDidDoc(
        JSON.stringify(doc.toData()),
        await this.fromHeight(request.afterProof),
        await this.untilHeight(request.contentId),
      );

      for (const i of validationRes.messages) {
        const issue: ValidationIssue = i;
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

  private async fromHeight(afterProof: IO.IAfterProof | null): Promise<number | undefined> {
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
    const beforeProofHistory: IBeforeProofHistory = await this.hydra.getBeforeProofHistory(contentId);

    if (beforeProofHistory.existsFromHeight) {
      return beforeProofHistory.existsFromHeight;
    }
    /* eslint no-undefined:0 */
    return undefined;
  }
}
