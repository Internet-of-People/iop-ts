import {Authentication, Did, IDidDocument, IDidDocumentData, IKeyData, isSameAuthentication, Right} from '../../../interfaces';

export class DidDocument implements IDidDocument {
  public constructor(private data: IDidDocumentData) {
  }

  public hasRight(auth: Authentication, right: Right): boolean {
    return this.activeKeysWithRight(right)
      .some(key => isSameAuthentication(key.auth, auth));
  }

  public fromData(data: IDidDocumentData): void {
    this.data = data; // TODO consider if we should clone here or is this OK
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

  private activeKeysWithRight(right: Right): IKeyData[] {
    const keysWithRight = this.data.rights.get(right) || [];
    return keysWithRight
      .map(idx => this.data.keys[idx])
      .filter(key => !key.expired);
  }
}
