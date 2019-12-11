import {KeyId} from '@internet-of-people/keyvault';
import {IKeyData} from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
const { DidDocument } = Operations;

describe('DidDocument', () => {
  const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
  const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
  const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');

  it.skip('can only impersonate if has rights', () => {
    const keys: IKeyData[] = [];
    const doc = new DidDocument.DidDocument({ did, keys, atHeight: 1 });

    expect(doc.canImpersonate(defaultKeyId)).toBeTruthy();
    expect(doc.canImpersonate(keyId1)).toBeFalsy();
  });

  it.skip('can only update if has rights', () => {
    const keys: IKeyData[] = [];
    const doc = new DidDocument.DidDocument({ did, keys, atHeight: 1 });

    expect(doc.canUpdateDocument(defaultKeyId)).toBeTruthy();
    expect(doc.canUpdateDocument(keyId1)).toBeFalsy();
  });
});
