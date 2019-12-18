import {
  Authentication,
  authenticationFromData,
  Did,
  IDidDocument,
  IDidDocumentData,
  IKeyData,
  isSameAuthentication,
  Right,
} from '../../../interfaces';

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

  public hasRight(auth: Authentication, right: Right): boolean {
    return this.validKeysWithRight(right)
      .some(([ idx, _ ]) => {
        return isSameAuthentication(this.keys[idx], auth);
      });
  }

  public isTombstoned(): boolean {
    return this.data.tombstoned;
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
    return this.data.atHeight;
  }

  public get did(): Did {
    return this.data.did;
  }

  private validKeysWithRight(right: Right): [number, IKeyData][] {
    const keysWithRight = this.data.rights[right] || [];
    return keysWithRight
      .map((idx) => {
        return [ idx, this.data.keys[idx] ] as [number, IKeyData];
      })
      .filter(([ _, key ]) => {
        return key.valid;
      });
  }
}
