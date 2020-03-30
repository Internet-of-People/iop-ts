import cloneDeep from 'lodash.clonedeep';

import { IO } from '@internet-of-people/sdk';
type Authentication = IO.Authentication;
type Did = IO.Did;
type Right = IO.Right;

import {
  IDidDocument,
  IDidDocumentOperations,
  IDidDocumentQueries,
  IDidDocumentState,
  IKeyData,
  isSameAuthentication,
  IRightsMap,
  IKeyRightHistory,
  IKeyRightHistoryPoint,
} from '../../../interfaces';
import { ITimeSeries, TimeSeries } from '../../../time-series';
import { DidDocument } from './document';
import Optional from 'optional-js';
import { RightRegistry } from './right-registry';

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
  auth: Authentication;
  addedAtHeight?: number;
  expiresAtHeight?: number;
  revoked: ITimeSeries;
  rights: IRightsMap<ITimeSeries>;
}

const mapAllRights = <T>(func: (right: Right) => T): IRightsMap<T> => {
  const map = {} as IRightsMap<T>;

  for (const right of RightRegistry.systemRights.all) {
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

export const isHeightInRangeExclUntil = (
  height: number, fromHeightInc: Optional<number>, untilHeightExc: Optional<number>,
): boolean => {
  if (fromHeightInc.isPresent() && height < fromHeightInc.get()) {
    return false;
  }

  if (untilHeightExc.isPresent() && height >= untilHeightExc.get()) {
    return false;
  }
  return true;
};

export const isHeightInRangeInclUntil = (
  height: number, fromHeightIncl: Optional<number>, untilHeightIncl: Optional<number>,
): boolean => {
  return isHeightInRangeExclUntil(height, fromHeightIncl, untilHeightIncl) ||
       untilHeightIncl.isPresent() && height === untilHeightIncl.get() ;
};

export const aggregateOptionals = <T>(
  aggregate: (...presents: T[]) => T, ...optionals: Optional<T>[]
): Optional<T> => {
  const presents = optionals.filter((opt) => {
    return opt.isPresent();
  });

  if (presents.length) {
    return Optional.of(aggregate(...presents.map((opt) => {
      return opt.get();
    })));
  } else {
    return Optional.empty();
  }
};

/**
 * Calculates the last height when the key entry is valid, based on auto-expiration, manual revocation of
 * the key and the tombstoning of the did that contains the key.
 */
const keyEntryValidUntil = (entry: IKeyEntry, tombstone: ITimeSeries): Optional<number> => {
  return aggregateOptionals(
    /* eslint @typescript-eslint/unbound-method: 0 */
    Math.min,
    Optional.ofNullable(entry.expiresAtHeight),
    entry.revoked.query.latestHeight(),
    tombstone.query.latestHeight(),
  );
};

const optionalToNullable = <T>(optional: Optional<T>): T | null => {
  return optional.isPresent() ? optional.get() : null;
};

const keyEntryToKeyData = (entry: IKeyEntry, index: number, height: number, tombstone: ITimeSeries): IKeyData => {
  const validUntil = keyEntryValidUntil(entry, tombstone);
  const validFromHeight = entry.addedAtHeight ?? null;
  const validUntilHeight = optionalToNullable(validUntil);
  const valid = isHeightInRangeExclUntil(height, Optional.ofNullable(validFromHeight), validUntil);
  const data: IKeyData = {
    index,
    auth: entry.auth.toString(),
    validFromHeight,
    validUntilHeight,
    valid,
  };
  return data;
};

const keyEntryIsValidAt = (entry: IKeyEntry, tombstone: ITimeSeries, height: number): boolean => {
  const validUntil = keyEntryValidUntil(entry, tombstone);
  return isHeightInRangeExclUntil(height, Optional.ofNullable(entry.addedAtHeight), validUntil);
};

// TODO: what if we rename it to DidDocumentTimeline
export class DidDocumentState implements IDidDocumentState {
  public readonly query: IDidDocumentQueries = {
    getAt: (height: number): IDidDocument => {
      const reversedKeys = this.keyStack.slice(0).reverse();

      const existingKeysAtHeight = reversedKeys
        .filter((key) => {
          // note:
          // - all keys that once added will be kept forever.
          // - It's possible that it will has right for nothing though.
          return (key.addedAtHeight || 0) <= height;
        });

      const keys = existingKeysAtHeight
        .map((key, index) => {
          return keyEntryToKeyData(key, index, height, this.tombstoneHistory);
        });

      const rights: IRightsMap<IKeyRightHistory[]> = mapAllRights((right) => {
        return existingKeysAtHeight.map((key, idx) => {
          const state = key.rights[right];

          const keyLink = `#${idx}`;
          const history: IKeyRightHistoryPoint[] = [];

          for (const point of state.query) {
            history.push({ height: point.height, valid: point.value });
          }
          const valid = state.query.get(height);

          return { keyLink, history, valid };
        });
      });

      const tombstoned = this.tombstoneHistory.query.get(height);
      const tombstonedAtHeight = optionalToNullable(this.tombstoneHistory.query.latestHeight());

      return new DidDocument({
        did: this.did.toString(),
        keys,
        rights,
        tombstoned,
        tombstonedAtHeight,
        queriedAtHeight: height,
      });
    },
  };

  public readonly apply: IDidDocumentOperations = {
    addKey: (height: number, auth: Authentication, expiresAtHeight?: number): void => {
      this.ensureMinHeight(height);
      this.ensureNotTombstoned(height);
      const existingKeyEntry = this.lastKeyEntryWithAuth(auth);

      if (existingKeyEntry && keyEntryIsValidAt(existingKeyEntry, this.tombstoneHistory, height)) {
        throw new Error(`DID ${this.did} already has a still valid key matching ${auth}`);
      }
      const rights = initialRights(false);
      this.keyStack.unshift({
        auth,
        rights,
        addedAtHeight: height,
        expiresAtHeight,
        revoked: new TimeSeries(false),
      });
    },

    revokeKey: (height: number, auth: Authentication): void => {
      this.ensureMinHeight(height);
      this.ensureNotTombstoned(height);

      const existingKeyIndex = this.lastKeyIndexWithAuth(auth);

      if (existingKeyIndex < 0) {
        throw new Error(`DID ${this.did} does not have a key matching ${auth}`);
      }

      const existingKeyEntry = this.keyStack[existingKeyIndex];

      if (!keyEntryIsValidAt(existingKeyEntry, this.tombstoneHistory, height)) {
        throw new Error(`DID ${this.did} has a key matching ${auth}, but it's already invalidated`);
      }

      existingKeyEntry.revoked.apply.set(height, true);
    },

    addRight: (height: number, auth: Authentication, right: Right): void => {
      this.ensureNotTombstoned(height);
      const rightHistory = this.getRightHistory(height, auth, right);

      try {
        rightHistory.apply.set(height, true);
      } catch {
        throw new Error(`right ${right} was already granted to ${auth} on DID ${this.did} at height ${height}`);
      }
    },

    revokeRight: (height: number, auth: Authentication, right: Right): void => {
      this.ensureNotTombstoned(height);
      const history = this.getRightHistory(height, auth, right);

      try {
        history.apply.set(height, false);
      } catch {
        throw new Error(
          `right ${right} cannot be revoked from ${auth} on DID ${this.did} as it was not present at height ${height}`,
        );
      }
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

      if (!this.keyStack.length) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because there are no keys`);
      }
      const [lastKey] = this.keyStack;

      // NOTE intentionally does not use isSameAuthentication() and entryIsValidAt() because
      //      exact types and values are already known here
      if (lastKey.auth.toString() !== auth.toString()) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because the key does not match the last added one.`);
      }

      if (lastKey.addedAtHeight !== height) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because it was not added at the specified height.`);
      }

      if (lastKey.expiresAtHeight !== expiresAtHeight) {
        throw new Error(`Cannot revert addKey in DID ${this.did}, because it was not added with the same expiration.`);
      }
      this.keyStack.shift();
    },

    revokeKey: (height: number, auth: Authentication): void => {
      this.ensureNotTombstoned(height);
      this.ensureMinHeight(height);

      const existingKeyIndex = this.lastKeyIndexWithAuth(auth);

      if (existingKeyIndex < 0) {
        throw new Error(`Cannot revert revokeKey in DID ${this.did} because it does not have a key matching ${auth}`);
      }

      const existingKeyEntry = this.keyStack[existingKeyIndex];
      existingKeyEntry.revoked.revert.set(height, true);

      if (!keyEntryIsValidAt(existingKeyEntry, this.tombstoneHistory, height)) {
        throw new Error(
          `Failed to revert revokeKey in DID ${this.did} for key matching ${auth}.\
           It's still invalid after reverted revoking`,
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
  private readonly keyStack: Readonly<IKeyEntry>[];
  private readonly tombstoneHistory: ITimeSeries;

  public constructor(
    public readonly did: Did,
    keyStack?: Readonly<IKeyEntry>[],
    tombstoneHistory?: ITimeSeries) {
    this.keyStack = keyStack ?? [{
      auth: did.defaultKeyId(),
      revoked: new TimeSeries(false),
      rights: initialRights(true),
    }];
    this.tombstoneHistory = tombstoneHistory ?? new TimeSeries(false);
  }

  public clone(): IDidDocumentState {
    return new DidDocumentState(this.did, cloneDeep(this.keyStack), this.tombstoneHistory.clone());
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
    if (!RightRegistry.isRightRegistered(right)) {
      throw new Error(`Right ${right} is not registered`);
    }

    const entry = this.lastKeyEntryWithAuth(auth);

    if (!entry || !keyEntryIsValidAt(entry, this.tombstoneHistory, height)) {
      throw new Error(`DID ${this.did} has no valid key matching ${auth} at height ${height}`);
    }

    const rightHistory = entry.rights[right];

    if (!rightHistory) {
      throw new Error(`DID ${this.did} has no right history of right ${right}`);
    }

    return rightHistory;
  }

  private lastKeyIndexWithAuth(auth: Authentication): number {
    return this.keyStack.findIndex((entry) => {
      return isSameAuthentication(entry.auth, auth);
    });
  }

  private lastKeyEntryWithAuth(auth: Authentication): IKeyEntry | undefined {
    return this.keyStack.find((entry) => {
      return isSameAuthentication(entry.auth, auth);
    });
  }
}
