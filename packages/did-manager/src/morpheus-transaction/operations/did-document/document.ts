import {KeyId, PublicKey} from '@internet-of-people/keyvault';
import {Authentication, IDidDocument, IDidDocumentData, IKeyData} from '../../../interfaces';

export class DidDocument implements IDidDocument {
  public constructor(private data: IDidDocumentData) {
  }

  public canImpersonate(auth: Authentication): boolean {
    return this.hasValidAuthentication(auth, 'impersonate'); // TODO right enum
  }

  public canUpdateDocument(auth: Authentication): boolean {
    return this.hasValidAuthentication(auth, 'update'); // TODO right enum
  }

  public fromData(data: IDidDocumentData): void {
    this.data = data; // TODO consider if we should clone here or is this OK
  }

  public toData(): IDidDocumentData {
    return this.data; // TODO consider if we should clone here or is this OK
  }

  public getHeight(): number {
    return this.data.atHeight;
  }

  private hasValidAuthentication(auth: Authentication, right: string): boolean {
    for (const key of this.activeKeys()) {
      if (! this.isSameAuthentication(key.auth, auth) ) {
        continue;
      }
      // TODO check access rights here with some enum type
      return true;
    }
    return false;
  }

  private activeKeys(): IKeyData[] {
    return this.data.keys.filter((key) => !key.expired);
  }

  private isSameAuthentication(left: Authentication, right: Authentication): boolean {
    // NOTE ugly implementation of double dispatch for both params
    if (left instanceof PublicKey) {
      if (right instanceof KeyId) {
        return left.validateId(right);
      }
      else {
        return left.toString() === right.toString();
      }
    }
    else {
      if (right instanceof KeyId) {
        return left.toString() === right.toString();
      }
      else {
        return right.validateId(left);
      }
    }
  }
}
