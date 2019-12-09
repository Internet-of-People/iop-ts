import {IKeyData} from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
const { DidDocument } = Operations;

describe('DidDocument', () => {
  it.skip('can only impersonate if has rights', () => {
    const keys: IKeyData[] = [];
    const doc = new DidDocument.DidDocument({ keys, atHeight: 1 });

    expect(doc.canImpersonate('?')).toBeTruthy();
    expect(doc.canImpersonate('?')).toBeFalsy();
  });

  it.skip('can only update if has rights', () => {
    const keys: IKeyData[] = [];
    const doc = new DidDocument.DidDocument({ keys, atHeight: 1 });

    expect(doc.canUpdateDocument('?')).toBeTruthy();
    expect(doc.canUpdateDocument('?')).toBeFalsy();
  });
});
