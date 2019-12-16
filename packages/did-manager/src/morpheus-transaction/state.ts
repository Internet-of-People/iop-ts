import cloneDeep from 'lodash.clonedeep';
import Optional from 'optional-js';
import {
  IMorpheusOperations,
  IMorpheusQueries,
  IMorpheusState,
  Did,
  IDidDocument,
  Authentication,
  Right,
  IBeforeProofState,
  IDidDocumentState,
  isSameAuthentication,
} from '../interfaces';
import { BeforeProofState } from './operations/before-proof';
import { DidDocumentState } from './operations/did-document';

export class MorpheusState implements IMorpheusState {
  public readonly query: IMorpheusQueries = {
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
  };

  public readonly apply: IMorpheusOperations = {
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
    revokeKey: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      revokedAuth: Authentication,
    ): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, revokedAuth);
      state.apply.revokeKey(height, revokedAuth);
      this.didDocuments.set(did, state);
    },
    addRight: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      auth: Authentication,
      right: Right,
    ): void => {
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
  };

  public readonly revert: IMorpheusOperations = {
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
    revokeKey: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      revokedAuth: Authentication,
    ): void => {
      const state = this.beginUpdateDidDocument(did, height, signerAuth);
      this.ensureDifferentAuth(signerAuth, revokedAuth);
      state.revert.revokeKey(height, revokedAuth);
      this.didDocuments.set(did, state);
    },
    addRight: (
      height: number,
      signerAuth: Authentication,
      did: Did,
      auth: Authentication,
      right: Right,
    ): void => {
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
    }
  };

  private confirmedTxs: Map<string, boolean> = new Map();
  private beforeProofs: Map<string, IBeforeProofState> = new Map();
  private didDocuments: Map<Did, IDidDocumentState> = new Map();

  public clone(): IMorpheusState {
    const cloned = new MorpheusState();
    cloned.confirmedTxs = cloneDeep(this.confirmedTxs);

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

    if (!state.query.getAt(height).hasRight(signerAuth, Right.Update)) {
      throw new Error(`${signerAuth} cannot update ${did} at height ${height}`);
    }
    return state;
  }

  private ensureDifferentAuth(signerAuth: Authentication, auth: Authentication): void {
    if (isSameAuthentication(signerAuth, auth)) {
      throw new Error(`${signerAuth} cannot modify its own authorization (as ${auth})`);
    }
  }
}
