import { KeyId } from '@internet-of-people/keyvault';
import { IKeyData, Right } from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
const { DidDocument } = Operations;

describe('DidDocument', () => {
  const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
  const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
  const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');

  it('hasRights answers properly', () => {
    const keys: IKeyData[] = [
      { auth: defaultKeyId, expired: false, },
    ];
    const rights = new Map([
      [Right.Impersonate, [0]],
      [Right.Update, [0]],
    ]);
    const doc = new DidDocument.DidDocument({ did, keys, rights, atHeight: 1 });

    expect(doc.hasRight(defaultKeyId, Right.Impersonate)).toBeTruthy();
    expect(doc.hasRight(defaultKeyId, Right.Update)).toBeTruthy();
    expect(doc.hasRight(keyId1, Right.Impersonate)).toBeFalsy();
    expect(doc.hasRight(keyId1, Right.Update)).toBeFalsy();
  });

});
