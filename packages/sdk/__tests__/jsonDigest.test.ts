import { Crypto, Types } from '../src';

type IDynamicContent = Types.Sdk.IDynamicContent;

describe('json-digest', () => {
  const testObj: IDynamicContent = { b: 1, a: 2 };
  const testObjDigest = 'cjumTq1s6Tn6xkXolxHj4LmAo7DAb-zoPLhEa1BvpovAFU';
  const arrayDigest = 'cjuGkDpb1HL7F8xFKDFVj3felfKZzjrJy92-108uuPixNw';
  const complexDigest = 'cjubdcpA0FfHhD8yEpDzZ8vS5sm7yxkrX_wAJgmke2bWRQ';

  it('digests simple object', () => {
    const digest = Crypto.digestJson(testObj);
    expect(digest).toBe(testObjDigest);
  });

  it('digests array', () => {
    const digest = Crypto.digestJson([ testObj, testObj ] as unknown as IDynamicContent);
    expect(digest).toBe(arrayDigest);
  });

  it('half-digested array gets the same digest', () => {
    const digest = Crypto.digestJson([ testObj, testObjDigest ] as unknown as IDynamicContent);
    expect(digest).toBe(arrayDigest);
  });

  it('fully digested array gets the same digest', () => {
    const digest = Crypto.digestJson(
      [ testObjDigest, testObjDigest ] as unknown as IDynamicContent,
    );
    expect(digest).toBe(arrayDigest);
  });

  it('digests complex object', () => {
    const complex: IDynamicContent = { z: testObj, y: testObj };
    const digest = Crypto.digestJson(complex);
    expect(digest).toBe(complexDigest);
  });

  it('digests really complex object', () => {
    const complex: IDynamicContent = { z: testObj, y: testObj };
    const doubleComplex: IDynamicContent = { z: complex, y: complex };
    const tripleComplex: IDynamicContent = { z: doubleComplex, y: doubleComplex };
    const doubleDigest = Crypto.digestJson(doubleComplex);
    expect(doubleDigest).toBe('cjuQLebyl_BJipFLibhWiStDBqK5J4JZq15ehUqybfTTKA');
    const tripleDigest = Crypto.digestJson(tripleComplex);
    expect(tripleDigest).toBe('cjuik140L3w7LCi6z1eHt7Qgwr2X65-iy8HA6zqrlUdmVk');
  });

  it('half-digested complex object gets the same digest', () => {
    const complex: IDynamicContent = { z: testObj, y: testObjDigest };
    const digest = Crypto.digestJson(complex);
    expect(digest).toBe(complexDigest);
  });

  it('fully digested complex object gets the same digest', () => {
    const complex: IDynamicContent = { z: testObjDigest, y: testObjDigest };
    const digest = Crypto.digestJson(complex);
    expect(digest).toBe(complexDigest);
  });

  it('rejects objects with keys differing only in Unicode normalization', () => {
    const nfkd = Buffer.from('61cc816c6f6d', 'hex').toString('utf8');
    const nfc = Buffer.from('c3a16c6f6d', 'hex').toString('utf8');
    const objWithSameNormalizedKeys: IDynamicContent = {};
    objWithSameNormalizedKeys[nfkd] = 1;
    objWithSameNormalizedKeys[nfc] = 2;

    expect(() => {
      return Crypto.digestJson(objWithSameNormalizedKeys);
    }).toThrowError('Data to be digested must contain field names normalized with Unicode NFKD');
  });

  it('rejects objects with cycles', () => {
    const obj1: IDynamicContent = { a: 1 };
    const obj2: IDynamicContent = { b: 2, c: obj1 };
    obj1['d'] = obj2;

    expect(() => {
      return Crypto.digestJson(obj1);
    }).toThrowError('Converting circular structure to JSON');
  });
});
