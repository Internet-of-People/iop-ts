import { SignedMessage, PublicKey, Signature } from '@internet-of-people/keyvault';

import {
  IContent,
  ISigned,
  ISignature,
  IAfterProof,
  IAfterEnvelope,
  Content,
  ContentId,
} from './interfaces/io';
import { JsonUtils } from '.';

export class Signed<T extends IContent> {
  public constructor(public readonly data: ISigned<T>, public readonly typeName: string) {
    if (!this.data) {
      throw new Error(`Signed ${this.typeName} cannot be constructed without any data`);
    }
  }

  public get signature(): ISignature {
    if (!this.data.signature) {
      throw new Error(`Signed ${this.typeName} ${this.contentId} is missing signature`);
    }
    return this.data.signature;
  }

  public get afterProof(): IAfterProof | null {
    const { afterEnvelope } = this;

    if (afterEnvelope.afterProof) {
      return afterEnvelope.afterProof;
    }
    return null;
  }

  public get payload(): Content<T> {
    const { afterEnvelope } = this;

    if (afterEnvelope.afterProof) {
      return afterEnvelope.content;
    }
    return this.data.content as Content<T>;
  }

  public get payloadObject(): T {
    if (typeof this.payload !== 'object') {
      throw new Error(`Signed ${this.typeName} ${this.contentId} only has a digest of the content`);
    }
    return this.payload;
  }

  public get contentId(): ContentId {
    return JsonUtils.digest(this.data);
  }

  public get signableContentId(): ContentId {
    return typeof this.data.content === 'object' ?
      JsonUtils.digest(this.data.content) :
      this.data.content;
  }

  public checkSignature(): boolean {
    const publicKey = new PublicKey(this.signature.publicKey);
    const message = Uint8Array.from(Buffer.from(this.signableContentId, 'utf8'));
    const signature = new Signature(this.signature.bytes);
    const validator = new SignedMessage(publicKey, message, signature);
    return validator.validate();
  }

  private get afterEnvelope(): IAfterEnvelope<T> {
    if (!this.data.content) {
      throw new Error(`Signed ${this.typeName} ${this.contentId} is missing content`);
    }
    return this.data.content as IAfterEnvelope<T>;
  }
}
