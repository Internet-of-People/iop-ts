import cloneDeep from 'lodash.clonedeep';
import {
  Authentication,
  Did,
  didToAuth,
  IDidDocument,
  IDidDocumentOperations,
  IDidDocumentQueries,
  IDidDocumentState,
  IKeyData,
  isSameAuthentication,
  Right,
} from '../../../interfaces';
import { ITimeSeries, TimeSeries } from '../../../time-series';
import { DidDocument } from './document';

// TODO these might needed to be moved somewhere else
export enum AuthenticationKind {
  PublicKey = 'PublicKey',
  KeyId = 'KeyId',
}

export enum CipherSuite {
  Ed25519Key = 'Ed25519',
  Secp256k1Key = 'Secp256k1',
}

interface IEntry {
  // TODO probably should be
  // kind: AuthenticationKind;
  // cipherSuite: CipherSuite,
  auth: Authentication;
  validFromHeight?: number;
  validUntilHeight?: number;
  revoked: boolean,
  rights: Map<Right, ITimeSeries>;
}

export const ALL_RIGHTS = [ Right.Impersonate, Right.Update ];

export const mapAllRights = <T>(func: (right: Right) => T): Map<Right, T> => {
  const mapTuples = ALL_RIGHTS
    .map((r: Right) => {
      const tuple: [Right, T] = [ r, func(r) ];
      return tuple;
    });
  return new Map(mapTuples);
};

export const initialRights = (initial: boolean): Map<Right, ITimeSeries> => {
  return mapAllRights((_) => {
    return new TimeSeries(initial) as ITimeSeries;
  });
};

const entryIsValidAt = (entry: IEntry, height: number): boolean => {
  let valid = !entry.revoked;
  valid = valid && ( (entry.validFromHeight || 0) <= height );
  valid = valid && ( !entry.validUntilHeight || entry.validUntilHeight > height );
  return valid;
};

const entryToKeyData = (entry: IEntry, height: number): IKeyData => {
  const data: IKeyData = {
    auth: entry.auth.toString(),
    revoked: entry.revoked,
    valid: entryIsValidAt(entry, height),
  };

  if (entry.validFromHeight) {
    data.validFromHeight = entry.validFromHeight;
  }
  if (entry.validUntilHeight) {
    data.validUntilHeight = entry.validUntilHeight;
  }

  return data;
};

export class DidDocumentState implements IDidDocumentState {
  public readonly query: IDidDocumentQueries = {
    getAt: (height: number): IDidDocument => {
      const reversedKeys = this.keyEntries.slice(0).reverse();
      const validKeys = reversedKeys
        .filter((key) => {
          return (key.validFromHeight || 0) <= height;
        });
      const keys = validKeys
        .map((key) => {
          return entryToKeyData(key, height);
        });

      const rights: Map<Right, number[]> = mapAllRights((r) => {
        const indexesWithRight: number[] = [];

        for (let i = 0; i < validKeys.length; i += 1) {
          const rightTimeSeries = validKeys[i].rights.get(r);

          if (!rightTimeSeries || !rightTimeSeries.query.get(height)) {
            continue;
          }
          indexesWithRight.push(i);
        }
        return indexesWithRight;
      });

      return new DidDocument({ did: this.did, keys, rights, atHeight: height });
    },
  };

  public readonly apply: IDidDocumentOperations = {
    addKey: (height: number, auth: Authentication, expiresAtHeight?: number): void => {
      this.ensureMinHeight(height);
      const entryPresent = this.lastEntryWithAuth(auth);

      if (entryPresent && entryIsValidAt(entryPresent, height)) {
        throw new Error(`DID ${this.did} already has a still valid key matching ${auth}`);
      }
      const rights = initialRights(false);
      this.keyEntries.unshift({ auth, rights, validFromHeight: height,
        validUntilHeight: expiresAtHeight, revoked: false });
    },

    revokeKey: (height: number, auth: Authentication): void => {
      this.ensureMinHeight(height);

      const indexPresent = this.lastIndexWithAuth(auth);
      if (indexPresent < 0) {
        throw new Error(`DID ${this.did} does not have a key matching ${auth}`);
      }

      const entryPresent = this.keyEntries[indexPresent];
      if( ! entryIsValidAt(entryPresent, height)) {
        throw new Error(`DID ${this.did} has a key matching ${auth}, but it's already invalidated`);
      }

      this.keyEntries[indexPresent].revoked = true;
    },

    addRight: (height: number, auth: Authentication, right: Right): void => {
      this.getRightHistory(height, auth, right).apply.set(height, true);
    },

    revokeRight: (height: number, auth: Authentication, right: Right): void => {
      this.getRightHistory(height, auth, right).apply.set(height, false);
    },
  };

  public readonly revert: IDidDocumentOperations = {
    addKey: (height: number, auth: Authentication, expiresAtHeight?: number): void => {
      this.ensureMinHeight(height);

      if (!this.keyEntries.length) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because there are no keys`);
      }
      const [lastKey] = this.keyEntries;

      // NOTE intentionally does not use isSameAuthentication() and entryIsValidAt() because
      //      exact types and values are already known here
      if (lastKey.auth !== auth) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because the key does not match the last added one.`);
      }

      if (lastKey.validFromHeight !== height) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because it was not added at the specified height.`);
      }

      if (lastKey.validUntilHeight !== expiresAtHeight) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because it was not added with the same expiration.`);
      }
      this.keyEntries.shift();
    },

    revokeKey: (height: number, auth: Authentication): void => {
      this.ensureMinHeight(height);

      const indexPresent = this.lastIndexWithAuth(auth);
      if (indexPresent < 0) {
        throw new Error(`Cannot revert revokeKey in DID ${this.did} because it does not have a key matching ${auth}`);
      }

      const entryPresent = this.keyEntries[indexPresent];
      entryPresent.revoked = false;

      if( ! entryIsValidAt(entryPresent, height)) {
        throw new Error(`Failed to revert revokeKey in DID ${this.did} for key matching ${auth} because it's still invalid after unrevoking`);
      }
    },

    addRight: (height: number, auth: Authentication, right: Right): void => {
      this.getRightHistory(height, auth, right).revert.set(height, true);
    },

    revokeRight: (height: number, auth: Authentication, right: Right): void => {
      this.getRightHistory(height, auth, right).apply.set(height, false);
    },
  };

  /**
   * All keys added to the DID. Latest addition first. When a key is removed, the entry is
   * invalidated, but not deleted, so the index of the entry never expires in other data fields.
   * When a removed key is added again, a new entry is added with a new index.
   */
  private keyEntries: IEntry[] = [];

  public constructor(public readonly did: Did) {
    this.keyEntries.unshift({
      auth: didToAuth(did),
      revoked: false,
      rights: initialRights(true),
    });
  }

  public clone(): IDidDocumentState {
    const result = new DidDocumentState(this.did);
    result.keyEntries = cloneDeep(this.keyEntries);
    return result;
  }

  private ensureMinHeight(height: number): void {
    if (height < 2) {
      throw new Error('Keys cannot be added before 2');
    }
  }

  private getRightHistory(height: number, auth: Authentication, right: Right): ITimeSeries {
    const entry = this.lastEntryWithAuth(auth);

    if (!entry || !entryIsValidAt(entry, height)) {
      throw new Error(`DID ${this.did} has no valid key matching ${auth}`);
    }
    const rightHistory = entry.rights.get(right);

    if (!rightHistory) {
      throw new Error(`DID ${this.did} has no right history of right ${right}`);
    }

    return rightHistory;
  }

  private lastIndexWithAuth(auth: Authentication): number {
    return this.keyEntries.findIndex((entry) => {
      return isSameAuthentication(entry.auth, auth);
    });
  }

  private lastEntryWithAuth(auth: Authentication): IEntry | undefined {
    return this.keyEntries.find((entry) => {
      return isSameAuthentication(entry.auth, auth);
    });
  }
}
