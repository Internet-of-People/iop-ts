import { KeyId } from '@internet-of-people/keyvault';
import { IKeyData, Right, IRightsMap } from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';

const { DidDocument } = Operations;

describe('DidDocument', () => {
  const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
  const defaultKeyId = new KeyId('IezbeWGSY2dqcUBqT8K7R14xr');
  const keyId1 = new KeyId('Iez25N5WZ1Q6TQpgpyYgiu9gTX');
  const keys: IKeyData[] = [
    { auth: defaultKeyId.toString(), revoked: false, valid: true },
  ];
  const rights = {} as IRightsMap<number[]>;
  rights[Right.Impersonate] = [0];
  rights[Right.Update] = [0];
  const atHeight = 1;

  it('hasRights answers properly', () => {
    const doc = new DidDocument.DidDocument({ did, keys, rights, atHeight, tombstoned: false });

    expect(doc.hasRight(defaultKeyId, Right.Impersonate)).toBeTruthy();
    expect(doc.hasRight(defaultKeyId, Right.Update)).toBeTruthy();
    expect(doc.hasRight(keyId1, Right.Impersonate)).toBeFalsy();
    expect(doc.hasRight(keyId1, Right.Update)).toBeFalsy();
  });

  it('fromData restores data correctly', () => {
    const doc = new DidDocument.DidDocument({ 
      did, 
      keys: [], 
      rights: {} as IRightsMap<number[]>, 
      atHeight, 
      tombstoned: false,
    });
    expect(doc.toData().keys).toHaveLength(0);
    expect(doc.toData().did).toBe(did);
    expect(doc.toData().atHeight).toBe(1);
    expect(Object.keys(doc.toData().rights).length).toBe(0);

    doc.fromData({ did, keys, rights, atHeight, tombstoned: false });
    expect(doc.toData().keys).toHaveLength(1);
    expect(doc.toData().keys[0].auth).toBe(defaultKeyId.toString());
    expect(doc.toData().keys[0].valid).toBeTruthy();
    /* eslint no-undefined: 0 */
    expect(doc.toData().keys[0].validUntilHeight).toBe(undefined);
    expect(doc.toData().did).toBe(did);
    expect(doc.toData().atHeight).toBe(1);
    expect(Object.keys(doc.toData().rights).length).toBe(2);
    expect(doc.toData().rights[Right.Impersonate]).toStrictEqual([0]);
    expect(doc.toData().rights[Right.Update]).toStrictEqual([0]);
  });

  it('did can be tombstoned', () => {
    const doc = new DidDocument.DidDocument({ did, keys, rights, atHeight, tombstoned: true });
    expect(doc.toData().tombstoned).toBeTruthy();
  });
});
