import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";

const { Operations: { BeforeProof: { State: { BeforeProofState } } } } = MorpheusTransaction;

export interface IMorpheusOperations {
  registerBeforeProof(contentId: string, height: number): void;
  revokeBeforeProof(contentId: string, height: number): void;
  /**
   * Marks a transaction as confirmed, all operations were valid.
   */
  confirmTx(transactionId: string): void;
}

export interface IMorpheusQueries {
  beforeProofExistsAt(contentId: string, height: number): boolean;
  isConfirmed(transactionId: string): boolean;
}

export interface IMorpheusState {
  readonly query: IMorpheusQueries;
  readonly apply: IMorpheusOperations;
  readonly revert: IMorpheusOperations;
}

export class MorpheusState implements IMorpheusState {
  public readonly query: IMorpheusQueries = {
    isConfirmed: (transactionId: string): boolean => {
      return this.confirmedTxs[transactionId] || false;
    },
    beforeProofExistsAt: (contentId: string, height: number): boolean => {
      const beforeProofState = this.beforeProofs.get(contentId);
      return beforeProofState !== undefined && beforeProofState.query.existsAt(height);
    }
  };

  public readonly apply: IMorpheusOperations = {
    confirmTx: (transactionId: string): void => {
      if(this.confirmedTxs[transactionId]) {
        throw new Error(`Transaction ${transactionId} was already confirmed.`);
      }
      this.confirmedTxs[transactionId] = true;
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
    }
  };

  public readonly revert: IMorpheusOperations = {
    confirmTx: (transactionId: string): void => {
      if(!this.confirmedTxs[transactionId]) {
        throw new Error(`Transaction ${transactionId} was not confirmed.`);
      }
      delete this.confirmedTxs[transactionId];
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
    }
  };
  private confirmedTxs: { [key: string]: boolean } = {};

  private beforeProofs = new Map<string, Interfaces.IBeforeProofState>();

  private getOrCreateBeforeProof(contentId: string): Interfaces.IBeforeProofState {
    return this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
  }
}
