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
  IRightsMap,
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

interface IKeyEntry {
  // TODO probably should be
  // kind: AuthenticationKind;
  // cipherSuite: CipherSuite,
  auth: Authentication;
  validFromHeight?: number;
  validUntilHeight?: number;
  revoked: ITimeSeries;
  rights: IRightsMap<ITimeSeries>;
}

export const ALL_RIGHTS = [ Right.Impersonate, Right.Update ];

const mapAllRights = <T>(func: (right: Right) => T): IRightsMap<T> => {
  const map = {} as IRightsMap<T>;

  for (const right of ALL_RIGHTS) {
    map[right] = func(right);
  }

  return map;
};

// Note: that this only work, because we keep the state in memory, hence every bootstrap the state will be rebuilt
// Otherwise it would be problematic if we add a new right without "migrating" it.
export const initialRights = (initial: boolean): IRightsMap<ITimeSeries> => {
  return mapAllRights((_) => {
    return new TimeSeries(initial) as ITimeSeries;
  });
};

const entryIsValidAt = (entry: IKeyEntry, height: number): boolean => {
  let valid = !entry.revoked.query.get(height);
  valid = valid && (entry.validFromHeight || 0) <= height ;
  valid = valid && (!entry.validUntilHeight || entry.validUntilHeight > height);
  return valid;
};

const keyEntryToKeyData = (entry: IKeyEntry, height: number, didTombstoned: boolean): IKeyData => {
  const data: IKeyData = {
    auth: entry.auth.toString(),
    revoked: entry.revoked.query.get(height),
    valid: entryIsValidAt(entry, height) && !didTombstoned,
  };

  if (entry.validFromHeight) {
    data.validFromHeight = entry.validFromHeight;
  }

  if (entry.validUntilHeight) {
    data.validUntilHeight = entry.validUntilHeight;
  }

  return data;
};

// TODO: what if we rename it to DidDocumentTimeline
export class DidDocumentState implements IDidDocumentState {
  public readonly query: IDidDocumentQueries = {
    getAt: (height: number): IDidDocument => {
      const didTombstoned = this.tombstoneHistory.query.get(height);
      const reversedKeys = this.keyEntries.slice(0).reverse();

      const existingKeysAtHeight = reversedKeys
        .filter((key) => {
          // note:
          // - all keys that once added will be kept forever.
          // - It's possible that it will has right for nothing though.
          return (key.validFromHeight || 0) <= height;
        });

      const keys = existingKeysAtHeight
        .map((key) => {
          return keyEntryToKeyData(key, height, didTombstoned);
        });

      const rights: IRightsMap<number[]> = mapAllRights((right) => {
        const keysWithRightIndexes: number[] = [];

        for (let i = 0; i < existingKeysAtHeight.length; i += 1) {
          const rightTimeSeries: ITimeSeries = existingKeysAtHeight[i].rights[right];

          if (didTombstoned || !rightTimeSeries || !rightTimeSeries.query.get(height)) {
            continue;
          }
          keysWithRightIndexes.push(i);
        }

        return keysWithRightIndexes;
      });

      return new DidDocument({ did: this.did, keys, rights, atHeight: height, tombstoned: didTombstoned });
    },
  };

  public readonly apply: IDidDocumentOperations = {
    addKey: (height: number, auth: Authentication, expiresAtHeight?: number): void => {
      this.ensureMinHeight(height);
      this.ensureNotTombstoned(height);
      const entryPresent = this.lastEntryWithAuth(auth);

      if (entryPresent && entryIsValidAt(entryPresent, height)) {
        throw new Error(`DID ${this.did} already has a still valid key matching ${auth}`);
      }
      const rights = initialRights(false);
      this.keyEntries.unshift({
        auth,
        rights,
        validFromHeight:
        height,
        validUntilHeight: expiresAtHeight,
        revoked: new TimeSeries(false),
      });
    },

    revokeKey: (height: number, auth: Authentication): void => {
      this.ensureMinHeight(height);
      this.ensureNotTombstoned(height);

      const indexPresent = this.lastIndexWithAuth(auth);

      if (indexPresent < 0) {
        throw new Error(`DID ${this.did} does not have a key matching ${auth}`);
      }

      const entryPresent = this.keyEntries[indexPresent];

      if (! entryIsValidAt(entryPresent, height)) {
        throw new Error(`DID ${this.did} has a key matching ${auth}, but it's already invalidated`);
      }

      this.keyEntries[indexPresent].revoked.apply.set(height, true);
    },

    addRight: (height: number, auth: Authentication, right: Right): void => {
      this.ensureNotTombstoned(height);
      this.getRightHistory(height, auth, right).apply.set(height, true);
    },

    revokeRight: (height: number, auth: Authentication, right: Right): void => {
      this.ensureNotTombstoned(height);
      const history = this.getRightHistory(height, auth, right);

      if (! history.query.get(height)) {
        throw new Error(`right ${right} cannot be revoked from ${auth} as it was not present at height ${height}`);
      }

      this.getRightHistory(height, auth, right).apply.set(height, false);
    },

    tombstone: (height: number): void => {
      this.ensureNotTombstoned(height);
      this.tombstoneHistory.apply.set(height, true);
    },
  };

  public readonly revert: IDidDocumentOperations = {
    addKey: (height: number, auth: Authentication, expiresAtHeight?: number): void => {
      this.ensureNotTombstoned(height);
      this.ensureMinHeight(height);

      if (!this.keyEntries.length) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because there are no keys`);
      }
      const [lastKey] = this.keyEntries;

      // NOTE intentionally does not use isSameAuthentication() and entryIsValidAt() because
      //      exact types and values are already known here
      if (lastKey.auth.toString() !== auth.toString()) {
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
      this.ensureNotTombstoned(height);
      this.ensureMinHeight(height);

      const indexPresent = this.lastIndexWithAuth(auth);

      if (indexPresent < 0) {
        throw new Error(`Cannot revert revokeKey in DID ${this.did} because it does not have a key matching ${auth}`);
      }

      const entryPresent = this.keyEntries[indexPresent];
      entryPresent.revoked.revert.set(height, true);

      if (! entryIsValidAt(entryPresent, height)) {
        throw new Error(
          `Failed to revert revokeKey in DID ${this.did} for key matching ${auth}. it's still invalid after unrevoking`,
        );
      }
    },

    addRight: (height: number, auth: Authentication, right: Right): void => {
      this.ensureNotTombstoned(height);
      this.getRightHistory(height, auth, right).revert.set(height, true);
    },

    revokeRight: (height: number, auth: Authentication, right: Right): void => {
      this.ensureNotTombstoned(height);
      this.getRightHistory(height, auth, right).revert.set(height, false);
    },

    tombstone: (height: number): void => {
      // note: here we don't have to ensure that the did is not tombstoned as the last operation could be tombstone, so
      // we have to be able to revert it
      this.tombstoneHistory.revert.set(height, true);
    },
  };

  /**
   * All keys added to the DID. Latest addition first. When a key is removed, the entry is
   * invalidated, but not deleted, so the index of the entry never expires in other data fields.
   * When a removed key is added again, a new entry is added with a new index.
   */
  private keyEntries: IKeyEntry[] = [];
  private readonly tombstoneHistory: ITimeSeries = new TimeSeries(false);

  public constructor(public readonly did: Did) {
    this.keyEntries.unshift({
      auth: didToAuth(did),
      revoked: new TimeSeries(false),
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
      throw new Error('Keys cannot be added before height 2');
    }
  }

  private ensureNotTombstoned(height: number): void {
    if (this.tombstoneHistory.query.get(height)) {
      throw new Error(`did is tombstoned at height ${height}, cannot be updated anymore`);
    }
  }

  private getRightHistory(height: number, auth: Authentication, right: Right): ITimeSeries {
    const entry = this.lastEntryWithAuth(auth);

    if (!entry || !entryIsValidAt(entry, height)) {
      throw new Error(`DID ${this.did} has no valid key matching ${auth} at height ${height}`);
    }

    const rightHistory = entry.rights[right];

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

  private lastEntryWithAuth(auth: Authentication): IKeyEntry | undefined {
    return this.keyEntries.find((entry) => {
      return isSameAuthentication(entry.auth, auth);
    });
  }
}
