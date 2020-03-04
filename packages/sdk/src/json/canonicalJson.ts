export const identity = (json: string): string => {
  return json;
};

export const canonicalJson = (obj: unknown, digest: (json: string) => string = identity): string => {
  const wouldCycle = new WeakSet();

  /* eslint @typescript-eslint/no-explicit-any: 0 */
  const traverse = (key: string | number, nodeIn: any): string | undefined => {
    let node: any = nodeIn;

    if (nodeIn && nodeIn.toJSON && typeof nodeIn.toJSON === 'function') {
      node = nodeIn.toJSON(key);
    }

    /* eslint no-undefined: 0 */
    if (node === undefined) {
      return undefined;
    }

    if (typeof node !== 'object' || node === null) {
      return JSON.stringify(node); // returns `undefined` for Symbol, Function, `null` for Infinity, NaN
    }

    if (Array.isArray(node)) {
      const out = node.map((value, i) => {
        return traverse(i, value) || JSON.stringify(null);
      });
      const canonical = `[${ out.join(',') }]`;
      return JSON.stringify(digest(canonical));
    } else {
      if (wouldCycle.has(node)) {
        throw new TypeError('Found a cycle in object graph');
      } else {
        wouldCycle.add(node);
      }

      const out = [];

      const normalized: Map<string, any> = new Map();

      for (const subkey of Object.keys(node)) {
        const valueDigest = traverse(subkey, node[subkey]);

        if (!valueDigest) {
          continue;
        }
        const nfcKey = subkey.normalize('NFC');

        if (normalized.has(nfcKey)) {
          throw new TypeError('Object keys only differ in Unicode normalization');
        }
        normalized.set(nfcKey, valueDigest);
      }

      const sortedKeys = [...normalized.keys()].sort();

      for (const subkey of sortedKeys) {
        const keyValue = `${JSON.stringify(subkey)}:${normalized.get(subkey)}`;
        out.push(keyValue);
      }

      wouldCycle.delete(node);
      const canonical = `{${ out.join(',') }}`;
      return JSON.stringify(digest(canonical));
    }
  };
  return traverse('', obj) ?? JSON.stringify(null);
};
