import {
  Authentication,
  authenticationFromData,
  Did,
  IDidDocument,
  IDidDocumentData,
  IKeyData,
  isSameAuthentication,
  Right,
  IKeyRightHistory,
  IKeyRightHistoryPoint,
} from '../../../interfaces';
import { isHeightInRange } from './state';
import Optional from 'optional-js';

/**
 * This is a DTO class aggregating the info of the current state of the given DID.
 */
export class DidDocument implements IDidDocument {
  private data: IDidDocumentData;
  private keys: Authentication[] = [];

  public constructor(data: IDidDocumentData) {
    this.data = data; // Note: This only satisfies a linter rule
    this.fromData(data);
  }

  public hasRightAt(auth: Authentication, right: Right, height: number): boolean {
    this.ensureHeightIsKnown(height);

    const rightHistories: IKeyRightHistory[] = this.data.rights[right] || [];

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

  public fromData(data: IDidDocumentData): void {
    this.data = data; // TODO consider if we should clone here or is this OK
    this.keys = data.keys.map((keyData) => {
      return authenticationFromData(keyData.auth);
    });
  }

  public toData(): IDidDocumentData {
    return this.data; // TODO consider if we should clone here or is this OK
  }

  public get height(): number {
    return this.data.queriedAtHeight;
  }

  public get did(): Did {
    return this.data.did;
  }

  private ensureHeightIsKnown(height: number): void {
    if (height > this.height) {
      throw new Error(`Cannot query at ${height}, latest block seen was ${this.height}`);
    }
  }

  private isKeyValidAt(key: IKeyData, height: number): boolean {
    return isHeightInRange(height, Optional.ofNullable(key.validFromHeight), Optional.ofNullable(key.validUntilHeight));
  }

  private isRightValidAt(points: IKeyRightHistoryPoint[], height: number): boolean {
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
