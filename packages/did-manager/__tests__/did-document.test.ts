import { KeyId } from '@internet-of-people/keyvault';
import { IKeyData, Right } from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';
const { DidDocument } = Operations;

describe('DidDocument', () => {
  const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
  const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
  const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');
  const keys: IKeyData[] = [
    { auth: defaultKeyId.toString(), revoked: false, valid: true },
  ];
  const rights = new Map([
    [ Right.Impersonate, [0]],
    [ Right.Update, [0]],
  ]);
  const atHeight = 1;

  it('hasRights answers properly', () => {
    const doc = new DidDocument.DidDocument({ did, keys, rights, atHeight });

    expect(doc.hasRight(defaultKeyId, Right.Impersonate)).toBeTruthy();
    expect(doc.hasRight(defaultKeyId, Right.Update)).toBeTruthy();
    expect(doc.hasRight(keyId1, Right.Impersonate)).toBeFalsy();
    expect(doc.hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it('fromData restores data correctly', () => {
    const doc = new DidDocument.DidDocument({ did, keys: [], rights: new Map(), atHeight });
    expect(doc.toData().keys).toHaveLength(0);
    expect(doc.toData().did).toBe(did);
    expect(doc.toData().atHeight).toBe(1);
    expect(doc.toData().rights.size).toBe(0);

    doc.fromData({ did, keys, rights, atHeight });
    expect(doc.toData().keys).toHaveLength(1);
    expect(doc.toData().keys[0].auth).toBe(defaultKeyId.toString());
    expect(doc.toData().keys[0].valid).toBeTruthy();
    /* eslint no-undefined: 0 */
    expect(doc.toData().keys[0].validUntilHeight).toBe(undefined);
    expect(doc.toData().did).toBe(did);
    expect(doc.toData().atHeight).toBe(1);
    expect(doc.toData().rights.size).toBe(2);
    expect(doc.toData().rights.get(Right.Impersonate)).toStrictEqual([0]);
    expect(doc.toData().rights.get(Right.Update)).toStrictEqual([0]);
  });
});
