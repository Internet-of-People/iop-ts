import cloneDeep from 'lodash.clonedeep';
import Optional from 'optional-js';
import {
  Authentication,
  Did,
  IBeforeProofState,
  IDidDocument,
  IDidDocumentState,
  IDidTransactionsState,
  IDidTransactionsOperations,
  IMorpheusOperations,
  IMorpheusQueries,
  IMorpheusState,
  isSameAuthentication,
  IOperationVisitor,
  ISignableOperationVisitor,
  ISignedOperationsData,
  Operation,
  Right,
  TransactionId,
} from '../interfaces';
import { BeforeProofState } from './operations/before-proof';
import { DidDocumentState, RightRegistry } from './operations/did-document';
import { MorpheusStateHandler } from './state-handler';
import { Signed } from './operations';
import { DidTransactionsState } from './operations/did-document/did-transactions-state';

export class MorpheusState implements IMorpheusState {
  public readonly query: IMorpheusQueries = {
    lastSeenBlockHeight: (): number => {
      return this.lastSeenBlockHeight;
    },

    isConfirmed: (transactionId: string): Optional<boolean> => {
      return Optional.ofNullable(this.confirmedTxs.get(transactionId));
    },

    beforeProofExistsAt: (contentId: string, height?: number): boolean => {
      const beforeProofState = this.beforeProofs.get(contentId);
      /* eslint no-undefined: 0 */
      return beforeProofState !== undefined && beforeProofState.query.existsAt(height);
    },

    getDidDocumentAt: (did: Did, height: number): IDidDocument => {
      const didState = this.getOrCreateDidDocument(did);
      return didState.query.getAt(height);
    },

    getDidTransactionIds: (did: string, includeAttempts: boolean,
      fromHeightInc: number, untilHeightExc?: number): TransactionId[] => {
      let transactionIds = this.didTransactions.query.getBetween(did, fromHeightInc, untilHeightExc);

      if (!includeAttempts) {
        transactionIds = transactionIds.filter(
          (trId) => {
            return this.query.isConfirmed(trId).orElse(false);
          });
      }
      return transactionIds;
    },
  };

  public readonly apply: IMorpheusOperations = {
    setLastSeenBlockHeight: (height: number): void => {
      if (height < this.lastSeenBlockHeight) {
        throw new Error(
          `${MorpheusStateHandler.CORRUPTED_ERR_MSG} Error: the applied height is < last seen height.`,
        );
      }
      this.lastSeenBlockHeight = height;
    },

    registerOperationAttempt: (height: number, transactionId: string, operation: Operation): void => {
      const visitor = this.visitorRegisterOperationAttemptAtHeight(height, this.didTransactions.apply, transactionId);
      operation.accept(visitor);
    },

    confirmTx: (transactionId: string): void => {
      this.setConfirmTx(transactionId, true);
    },

    rejectTx: (transactionId: string): void => {
      this.setConfirmTx(transactionId, false);
    },

    registerBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.getOrCreateBeforeProof(contentId);
      beforeProof.apply.register(height);
      this.beforeProofs.set(contentId, beforeProof);
    },

    revokeBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.getOrCreateBeforeProof(contentId);
      beforeProof.apply.revoke(height);
      this.beforeProofs.set(contentId, beforeProof);
    },

    addKey: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      newAuth: Authentication,
      expiresAtHeight?: number,
    ): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      state.apply.addKey(height, newAuth, expiresAtHeight);
      this.didDocuments.set(did, state);
    },

    revokeKey: (height: number, signerAuth: Authentication, did: Did, revokedAuth: Authentication): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, revokedAuth);
      state.apply.revokeKey(height, revokedAuth);
      this.didDocuments.set(did, state);
    },

    addRight: (height: number, signerAuth: Authentication, did: Did, auth: Authentication, right: Right): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, auth);
      state.apply.addRight(height, auth, right);
      this.didDocuments.set(did, state);
    },

    revokeRight: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      auth: Authentication,
      right: Right,
    ): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, auth);
      state.apply.revokeRight(height, auth, right);
      this.didDocuments.set(did, state);
    },

    tombstoneDid: (height: number, signerAuth: Authentication, did: string): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      state.apply.tombstone(height);
      this.didDocuments.set(did, state);
    },
  };

  public readonly revert: IMorpheusOperations = {
    setLastSeenBlockHeight: (height: number): void => {
      if (height > this.lastSeenBlockHeight) {
        throw new Error(
          `${MorpheusStateHandler.CORRUPTED_ERR_MSG} Error: the reverted height is > last seen height.`,
        );
      }
      this.lastSeenBlockHeight = height;
    },

    registerOperationAttempt: (height: number, transactionId: string, operation: Operation): void => {
      const visitor = this.visitorRegisterOperationAttemptAtHeight(height, this.didTransactions.revert, transactionId);
      operation.accept(visitor);
    },

    confirmTx: (transactionId: string): void => {
      const confirmed = this.query.isConfirmed(transactionId);

      if (!confirmed.isPresent()) {
        throw new Error(`Transaction ${transactionId} was not seen.`);
      }

      if (!confirmed.get()) {
        throw new Error(`Transaction ${transactionId} was rejected, hence its confirmation cannot be reverted`);
      }

      this.confirmedTxs.delete(transactionId);
    },

    rejectTx: (transactionId: string): void => {
      const confirmed = this.query.isConfirmed(transactionId);

      if (!confirmed.isPresent()) {
        throw new Error(`Transaction ${transactionId} was not seen.`);
      }

      if (confirmed.get()) {
        throw new Error(`Transaction ${transactionId} was confirmed, hence its rejection cannot be reverted`);
      }

      this.confirmedTxs.delete(transactionId);
    },

    registerBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.getOrCreateBeforeProof(contentId);
      beforeProof.revert.register(height);
      this.beforeProofs.set(contentId, beforeProof);
    },

    revokeBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.getOrCreateBeforeProof(contentId);
      beforeProof.revert.revoke(height);
      this.beforeProofs.set(contentId, beforeProof);
    },

    addKey: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      newAuth: Authentication,
      expiresAtHeight?: number,
    ): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      state.revert.addKey(height, newAuth, expiresAtHeight);
      this.didDocuments.set(did, state);
    },

    revokeKey: (height: number, signerAuth: Authentication, did: Did, revokedAuth: Authentication): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, revokedAuth);
      state.revert.revokeKey(height, revokedAuth);
      this.didDocuments.set(did, state);
    },

    addRight: (height: number, signerAuth: Authentication, did: Did, auth: Authentication, right: Right): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, auth);
      state.revert.addRight(height, auth, right);
      this.didDocuments.set(did, state);
    },

    revokeRight: (
      height: number,
      signerAuth: Authentication,
      did: string,
      auth: Authentication,
      right: Right,
    ): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, auth);
      state.revert.revokeRight(height, auth, right);
      this.didDocuments.set(did, state);
    },

    tombstoneDid: (height: number, _: Authentication, did: string): void => {
      // note: checking for right in this case is not needed
      const state = this.getOrCreateDidDocument(did);
      state.revert.tombstone(height);
      this.didDocuments.set(did, state);
    },
  };

  private confirmedTxs: Map<string, boolean> = new Map();
  private beforeProofs: Map<string, IBeforeProofState> = new Map();
  private didDocuments: Map<Did, IDidDocumentState> = new Map();
  private didTransactions: IDidTransactionsState = new DidTransactionsState();
  private lastSeenBlockHeight = 0;

  public clone(): IMorpheusState {
    const cloned = new MorpheusState();
    cloned.confirmedTxs = cloneDeep(this.confirmedTxs);
    cloned.didTransactions = this.didTransactions.clone();

    const clonedBeforeProofs = new Map<string, IBeforeProofState>();

    for (const [ key, value ] of this.beforeProofs.entries()) {
      clonedBeforeProofs.set(key, value.clone());
    }
    cloned.beforeProofs = clonedBeforeProofs;

    const clonedDidDocuments = new Map<Did, IDidDocumentState>();

    for (const [ key, value ] of this.didDocuments.entries()) {
      clonedDidDocuments.set(key, value.clone());
    }
    cloned.didDocuments = clonedDidDocuments;

    cloned.lastSeenBlockHeight = this.lastSeenBlockHeight;
    return cloned;
  }

  private setConfirmTx(transactionId: string, value: boolean): void {
    if (this.confirmedTxs.get(transactionId)) {
      throw new Error(`Transaction ${transactionId} was already confirmed.`);
    }
    this.confirmedTxs.set(transactionId, value);
  }

  private getOrCreateBeforeProof(contentId: string): IBeforeProofState {
    return this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
  }

  private getOrCreateDidDocument(did: Did): IDidDocumentState {
    return this.didDocuments.get(did) || new DidDocumentState(did);
  }

  private beginUpdateDidDocument(
    did: Did,
    height: number,
    signerAuth: Authentication,
  ): IDidDocumentState {
    const state = this.getOrCreateDidDocument(did);
    const tombstoned = state.query.getAt(height).isTombstonedAt(height);
    const hasRight = state.query.getAt(height).hasRightAt(signerAuth, RightRegistry.systemRights.update, height);

    if (tombstoned) {
      throw new Error(`${signerAuth} cannot update ${did} at height ${height}. The DID is tombstoned`);
    }

    if (!hasRight) {
      throw new Error(`${signerAuth} has no right to update ${did} at height ${height}`);
    }

    return state;
  }

  private ensureDifferentAuth(signerAuth: Authentication, auth: Authentication): void {
    if (isSameAuthentication(signerAuth, auth)) {
      throw new Error(`${signerAuth} cannot modify its own authorization (as ${auth})`);
    }
  }


  private visitorRegisterSignedOperationAttemptAtHeight(height: number,
    state: IDidTransactionsOperations, transactionId: string): ISignableOperationVisitor<void> {
    return {
      addKey: (did: Did, _newAuth: Authentication, _expiresAtHeight?: number): void => {
        state.registerOperationAttempt(height, did, transactionId);
      },
      revokeKey: (did: Did, _auth: Authentication): void => {
        state.registerOperationAttempt(height, did, transactionId);
      },
      addRight: (did: Did, _auth: Authentication, _right: Right): void => {
        state.registerOperationAttempt(height, did, transactionId);
      },
      revokeRight: (did: Did, _auth: Authentication, _right: Right): void => {
        state.registerOperationAttempt(height, did, transactionId);
      },
      tombstoneDid(did: Did): void {
        state.registerOperationAttempt(height, did, transactionId);
      },
    };
  }

  private visitorRegisterOperationAttemptAtHeight(height: number,
    state: IDidTransactionsOperations, transactionId: string): IOperationVisitor<void> {
    return {
      signed: (operations: ISignedOperationsData): void => {
        const signableOperations = Signed.getAuthenticatedOperations(operations);
        const registerAttemptAtHeight = this.visitorRegisterSignedOperationAttemptAtHeight(
          height, state, transactionId);

        for (const signable of signableOperations) {
          signable.accept(registerAttemptAtHeight);
        }
      },
      registerBeforeProof: (_contentId: string): void => {
        /* eslint no-empty-function: 0 */
      },
      revokeBeforeProof: (_contentId: string): void => {
        /* eslint no-empty-function: 0 */
      },
    };
  }
}
