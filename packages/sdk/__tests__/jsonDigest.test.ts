import { IO, JsonUtils } from '../src';

describe('json-digest', () => {
  const testObj: IO.IDynamicContent = { b: 1, a: 2 };
  const testObjDigest = 'cjumTq1s6Tn6xkXolxHj4LmAo7DAb-zoPLhEa1BvpovAFU';
  const arrayDigest = 'cjuGkDpb1HL7F8xFKDFVj3felfKZzjrJy92-108uuPixNw';
  const complexDigest = 'cjubdcpA0FfHhD8yEpDzZ8vS5sm7yxkrX_wAJgmke2bWRQ';

  it('digests simple object', () => {
    const digest = JsonUtils.digest(testObj);
    expect(digest).toBe(testObjDigest);
  });

  it('digests array', () => {
    const digest = JsonUtils.digest([ testObj, testObj ] as unknown as IO.IDynamicContent);
    expect(digest).toBe(arrayDigest);
  });

  it('half-masked array gets the same digest', () => {
    const digest = JsonUtils.digest([ testObj, testObjDigest ] as unknown as IO.IDynamicContent);
    expect(digest).toBe(arrayDigest);
  });

  it('fully masked array gets the same digest', () => {
    const digest = JsonUtils.digest(
      [ testObjDigest, testObjDigest ] as unknown as IO.IDynamicContent,
    );
    expect(digest).toBe(arrayDigest);
  });

  it('digests complex object', () => {
    const complex: IO.IDynamicContent = { z: testObj, y: testObj };
    const digest = JsonUtils.digest(complex);
    expect(digest).toBe(complexDigest);
  });

  it('half-masked complex object gets the same digest', () => {
    const complex: IO.IDynamicContent = { z: testObj, y: testObjDigest };
    const digest = JsonUtils.digest(complex);
    expect(digest).toBe(complexDigest);
  });

  it('fully masked complex object gets the same digest', () => {
    const complex: IO.IDynamicContent = { z: testObjDigest, y: testObjDigest };
    const digest = JsonUtils.digest(complex);
    expect(digest).toBe(complexDigest);
  });

  it('rejects objects with keys differing only in Unicode normalization', () => {
    const nfkd = Buffer.from('61cc816c6f6d', 'hex').toString('utf8');
    const nfc = Buffer.from('c3a16c6f6d', 'hex').toString('utf8');
    const objWithSameNormalizedKeys: IO.IDynamicContent = {};
    objWithSameNormalizedKeys[nfkd] = 1;
    objWithSameNormalizedKeys[nfc] = 2;

    expect(() => {
      return JsonUtils.digest(objWithSameNormalizedKeys);
    }).toThrowError('Object keys only differ in Unicode normalization');
  });

  it('rejects objects with cycles', () => {
    const obj1: IO.IDynamicContent = { a: 1 };
    const obj2: IO.IDynamicContent = { b: 2, c: obj1 };
    obj1['d'] = obj2;

    expect(() => {
      return JsonUtils.digest(obj1);
    }).toThrowError('Found a cycle in object graph');
  });
});
