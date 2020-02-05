import { KeyId } from '@internet-of-people/keyvault';
import { IKeyData, Right, IRightsMap, IKeyRightHistory } from '../src/interfaces';
import { Operations } from '../src/morpheus-transaction';

const { DidDocument } = Operations;

describe('DidDocument', () => {
  const did = 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr';
  const defaultKeyId = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
  const keyId1 = new KeyId('iez25N5WZ1Q6TQpgpyYgiu9gTX');
  const keys: IKeyData[] = [{
    index: 0,
    auth: defaultKeyId.toString(),
    validFromHeight: null,
    validUntilHeight: null,
    valid: true,
  }];
  const rights = {} as IRightsMap<IKeyRightHistory[]>;
  rights[Right.Impersonate] = [
    { keyLink: '#0', history: [{ height: null, valid: true }], valid: true },
  ];
  rights[Right.Update] = [
    { keyLink: '#0', history: [{ height: null, valid: true }], valid: true },
  ];
  const atHeight = 1;

  it('hasRight trivial', () => {
    const doc1 = new DidDocument.DidDocument(
      { did, keys, rights, atHeight, tombstonedAtHeight: null, tombstoned: false },
    );

    expect(doc1.hasRightAt(defaultKeyId, Right.Impersonate, 1)).toBeTruthy();
    expect(doc1.hasRightAt(defaultKeyId, Right.Update, 1)).toBeTruthy();
    expect(doc1.hasRightAt(keyId1, Right.Impersonate, 1)).toBeFalsy();
    expect(doc1.hasRightAt(keyId1, Right.Update, 1)).toBeFalsy();
  });

  it('hasRight complex', () => {
    const keys2: IKeyData[] = [
      {
        index: 0,
        auth: defaultKeyId.toString(),
        validFromHeight: null,
        validUntilHeight: 6,
        valid: false,
      },
      {
        index: 1,
        auth: keyId1.toString(),
        validFromHeight: 2,
        validUntilHeight: null,
        valid: true,
      },
    ];
    const rights2 = {} as IRightsMap<IKeyRightHistory[]>;
    rights2[Right.Impersonate] = [
      {
        keyLink: '#0',
        history: [
          { height: null, valid: true },
          { height: 3, valid: false },
        ],
        valid: false,
      },
      {
        keyLink: '#1',
        history: [
          { height: null, valid: false },
          { height: 2, valid: true },
        ],
        valid: true,
      },
    ];
    rights2[Right.Update] = [
      {
        keyLink: '#0',
        history: [
          { height: null, valid: true },
        ],
        valid: false,
      },
      {
        keyLink: '#1',
        history: [
          { height: null, valid: false },
          { height: 3, valid: true },
        ],
        valid: true,
      },
    ];
    const doc10 = new DidDocument.DidDocument(
      { did, keys: keys2, rights: rights2, atHeight: 10, tombstonedAtHeight: null, tombstoned: false },
    );

    expect(doc10.hasRightAt(defaultKeyId, Right.Impersonate, 1)).toBeTruthy();
    expect(doc10.hasRightAt(defaultKeyId, Right.Impersonate, 3)).toBeFalsy();
    expect(doc10.hasRightAt(defaultKeyId, Right.Impersonate, 10)).toBeFalsy();
    expect(doc10.hasRightAt(keyId1, Right.Impersonate, 1)).toBeFalsy();
    expect(doc10.hasRightAt(keyId1, Right.Impersonate, 2)).toBeTruthy();
    expect(doc10.hasRightAt(keyId1, Right.Impersonate, 10)).toBeTruthy();
    expect(doc10.hasRightAt(defaultKeyId, Right.Update, 1)).toBeTruthy();
    expect(doc10.hasRightAt(defaultKeyId, Right.Update, 6)).toBeFalsy();
    expect(doc10.hasRightAt(defaultKeyId, Right.Update, 10)).toBeFalsy();
    expect(doc10.hasRightAt(keyId1, Right.Update, 1)).toBeFalsy();
    expect(doc10.hasRightAt(keyId1, Right.Update, 2)).toBeFalsy();
    expect(doc10.hasRightAt(keyId1, Right.Update, 3)).toBeTruthy();
    expect(doc10.hasRightAt(keyId1, Right.Update, 10)).toBeTruthy();
  });

  it('fromData restores data correctly', () => {
    const doc = new DidDocument.DidDocument({
      did,
      keys: [],
      rights: {} as IRightsMap<IKeyRightHistory[]>,
      atHeight,
      tombstonedAtHeight: null,
      tombstoned: false,
    });
    expect(doc.toData().keys).toHaveLength(0);
    expect(doc.toData().did).toBe(did);
    expect(doc.toData().atHeight).toBe(1);
    expect(Object.keys(doc.toData().rights).length).toBe(0);

    doc.fromData({ did, keys, rights, atHeight, tombstonedAtHeight: null, tombstoned: false });

    expect(doc.toData().did).toBe(did);
    expect(doc.toData().keys).toHaveLength(1);
    expect(doc.toData().keys[0].auth).toBe(defaultKeyId.toString());
    expect(doc.toData().keys[0].validFromHeight).toBe(null);
    expect(doc.toData().keys[0].validUntilHeight).toBe(null);
    expect(doc.toData().keys[0].valid).toBeTruthy();
    expect(Object.keys(doc.toData().rights).length).toBe(2);
    expect(doc.toData().rights[Right.Impersonate]).toHaveLength(1);
    expect(doc.toData().rights[Right.Impersonate][0]).toStrictEqual(
      { keyLink: '#0', history: [{ height: null, valid: true }], valid: true },
    );
    expect(doc.toData().rights[Right.Update]).toHaveLength(1);
    expect(doc.toData().rights[Right.Update][0]).toStrictEqual(
      { keyLink: '#0', history: [{ height: null, valid: true }], valid: true },
    );
    expect(doc.toData().atHeight).toBe(1);
    expect(doc.toData().tombstonedAtHeight).toBe(null);
    expect(doc.toData().tombstoned).toBeFalsy();
  });

  it('did can be tombstoned', () => {
    const doc = new DidDocument.DidDocument(
      { did, keys, rights, atHeight: 3, tombstonedAtHeight: 2, tombstoned: true },
    );

    expect(doc.isTombstonedAt(1)).toBeFalsy();
    expect(doc.isTombstonedAt(2)).toBeTruthy();
    expect(doc.toData().atHeight).toBe(3);
    expect(doc.toData().tombstonedAtHeight).toBe(2);
    expect(doc.toData().tombstoned).toBeTruthy();
  });
});
