import Optional from 'optional-js';
import { Did, authenticationFromData, isSameAuthentication } from '@internet-of-people/morpheus-crypto';
import { isHeightInRangeExclUntil } from './optional';
import { Crypto, Sdk, Layer2 } from '../types';

export class DidDocument implements Layer2.IDidDocument {
  private keys: Crypto.Authentication[] = [];

  public constructor(private data: Layer2.IDidDocumentData) {
    this.fromData(data);
  }

  public hasRightAt(auth: Crypto.Authentication, right: Sdk.Right, height: number): boolean {
    this.ensureHeightIsKnown(height);

    const rightHistories: Layer2.IKeyRightHistory[] = this.data.rights[right] || [];

    for (const rightHistory of rightHistories) {
      const idx = this.getKeyIdx(rightHistory.keyLink);
      const keyData = this.data.keys[idx];

      if (!this.isKeyValidAt(keyData, height)) {
        continue;
      }

      if (!isSameAuthentication(this.keys[idx], auth)) {
        continue;
      }
      const rightValid = this.isRightValidAt(rightHistory.history, height);
      return rightValid;
    }
    return false;
  }

  public isTombstonedAt(height: number): boolean {
    this.ensureHeightIsKnown(height);

    if (this.data.tombstonedAtHeight && height >= this.data.tombstonedAtHeight) {
      return true;
    }
    return false;
  }

  public fromData(data: Layer2.IDidDocumentData): void {
    this.data = data; // TODO consider if we should clone here or is this OK
    this.keys = data.keys.map((keyData) => {
      return authenticationFromData(keyData.auth);
    });
  }

  public toData(): Layer2.IDidDocumentData {
    return this.data; // TODO consider if we should clone here or is this OK
  }

  public get height(): number {
    return this.data.queriedAtHeight;
  }

  public get did(): Did {
    return new Did(this.data.did);
  }

  private ensureHeightIsKnown(height: number): void {
    if (height > this.height) {
      throw new Error(`Cannot query at ${height}, latest block seen was ${this.height}`);
    }
  }

  private isKeyValidAt(key: Layer2.IKeyData, height: number): boolean {
    return isHeightInRangeExclUntil(
      height,
      Optional.ofNullable(key.validFromHeight),
      Optional.ofNullable(key.validUntilHeight),
    );
  }

  private isRightValidAt(points: Layer2.IKeyRightHistoryPoint[], height: number): boolean {
    let validAtHeight = false;

    for (const point of points) {
      if (point.height && point.height > height) {
        break;
      }
      validAtHeight = point.valid;
    }
    return validAtHeight;
  }

  private getKeyIdx(keyLink: string): number {
    if (!keyLink.startsWith('#')) {
      throw new Error(`Only did-internal keyLinks are supported yet. Found ${keyLink}`);
    }
    const idx = Number(keyLink.substring(1));

    if (!Number.isSafeInteger(idx)) {
      throw new Error(`Invalid did-internal keyLink found: ${keyLink}`);
    }
    return idx;
  }
}
