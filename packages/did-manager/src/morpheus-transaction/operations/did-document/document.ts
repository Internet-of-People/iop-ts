import {Authentication, IDidDocument, IDidDocumentData} from "../../../interfaces";

export class DidDocument implements IDidDocument {
  public constructor(private data: IDidDocumentData) {
  }

  public canImpersonate(auth: Authentication): boolean {
    return false; // TODO implement this properly
  }

  public canUpdateDocument(auth: Authentication): boolean {
    return false; // TODO implement this properly
  }

  public fromData(data: IDidDocumentData): void {
    this.data = data; // TODO consider if we should clone here or is this OK
  }

  public toData(): IDidDocumentData {
    return this.data; // TODO consider if we should clone here or is this OK
  }

}
