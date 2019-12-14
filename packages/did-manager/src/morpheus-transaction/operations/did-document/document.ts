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

export class DidDocument implements IDidDocument {
  private data: IDidDocumentData;
  private keys: Authentication[] = [];

  public constructor(data: IDidDocumentData) {
    this.data = data; // Note: This only satisfies a linter rule
    this.fromData(data);
  }

  public hasRight(auth: Authentication, right: Right): boolean {
    return this.activeKeysWithRight(right)
      .some(([ idx, _ ]) => {
        return isSameAuthentication(this.keys[idx], auth);
      });
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

  private activeKeysWithRight(right: Right): [number, IKeyData][] {
    const keysWithRight = this.data.rights.get(right) || [];
    return keysWithRight
      .map((idx) => {
        return [ idx, this.data.keys[idx] ] as [number, IKeyData];
      })
      .filter(([ _, key ]) => {
        return !key.expired;
      });
  }
}
