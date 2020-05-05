import { digest, PublicKey, Signature, SignedJson } from '@internet-of-people/morpheus-crypto';
import { Sdk } from './types';

export class Signed<T extends Sdk.IContent> {
  public constructor(public readonly data: Sdk.ISigned<T>, public readonly typeName: string) {
    if (!this.data) {
      throw new Error(`Signed ${this.typeName} cannot be constructed without any data`);
    }
  }

  public get signature(): Sdk.ISignature {
    if (!this.data.signature) {
      throw new Error(`Signed ${this.typeName} ${this.contentId} is missing signature`);
    }
    return this.data.signature;
  }

  public get afterProof(): Sdk.IAfterProof | null {
    const { afterEnvelope } = this;

    if (afterEnvelope.afterProof) {
      return afterEnvelope.afterProof;
    }
    return null;
  }

  public get payload(): Sdk.Content<T> {
    const { afterEnvelope } = this;

    if (afterEnvelope.afterProof) {
      return afterEnvelope.content;
    }
    return this.data.content as Sdk.Content<T>;
  }

  public get payloadObject(): T {
    if (typeof this.payload !== 'object') {
      throw new Error(`Signed ${this.typeName} ${this.contentId} only has a digest of the content`);
    }
    return this.payload;
  }

  public get contentId(): Sdk.ContentId {
    return digest(this.data);
  }

  public get signableContentId(): Sdk.ContentId {
    return typeof this.data.content === 'object' ?
      digest(this.data.content) :
      this.data.content;
  }

  public checkSignature(): boolean {
    const publicKey = new PublicKey(this.signature.publicKey);
    const signature = new Signature(this.signature.bytes);
    const validator = new SignedJson(publicKey, this.data.content, signature);
    return validator.validate();
  }

  private get afterEnvelope(): Sdk.IAfterEnvelope<T> {
    if (!this.data.content) {
      throw new Error(`Signed ${this.typeName} ${this.contentId} is missing content`);
    }
    return this.data.content as Sdk.IAfterEnvelope<T>;
  }
}
