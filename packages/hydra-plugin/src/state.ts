import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";
import Optional from "optional-js";

const { Operations: { BeforeProof: { State: { BeforeProofState } } } } = MorpheusTransaction;

export interface IMorpheusOperations {
  registerBeforeProof(contentId: string, height: number): void;
  revokeBeforeProof(contentId: string, height: number): void;
  /**
   * Marks a transaction as confirmed, all operations were valid.
   */
  confirmTx(transactionId: string): void;
  rejectTx(transactionId: string): void;
}

export interface IMorpheusQueries {
  beforeProofExistsAt(contentId: string, height?: number): boolean;
  isConfirmed(transactionId: string): Optional<boolean>;
}

export interface IMorpheusState {
  readonly query: IMorpheusQueries;
  readonly apply: IMorpheusOperations;
  readonly revert: IMorpheusOperations;
}

export class MorpheusState implements IMorpheusState {
  public readonly query: IMorpheusQueries = {
    isConfirmed: (transactionId: string): Optional<boolean> => {
      return Optional.ofNullable(this.confirmedTxs[transactionId]);
    },
    beforeProofExistsAt: (contentId: string, height?: number): boolean => {
      const beforeProofState = this.beforeProofs.get(contentId);
      return beforeProofState !== undefined && beforeProofState.query.existsAt(height);
    }
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
    }
  };

  public readonly revert: IMorpheusOperations = {
    confirmTx: (transactionId: string): void => {
      const confirmed = this.query.isConfirmed(transactionId);
      if(!confirmed.isPresent()) {
        throw new Error(`Transaction ${transactionId} was not seen.`);
      }
      if(!confirmed.get()) {
        throw new Error(`Transaction ${transactionId} was rejected, hence its confirmation cannot be reverted`);
      }

      delete this.confirmedTxs[transactionId];
    },
    rejectTx: (transactionId: string): void => {
      const confirmed = this.query.isConfirmed(transactionId);
      if(!confirmed.isPresent()) {
        throw new Error(`Transaction ${transactionId} was not seen.`);
      }
      if(confirmed.get()) {
        throw new Error(`Transaction ${transactionId} was confirmed, hence its rejection cannot be reverted`);
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

  private setConfirmTx(transactionId: string, value: boolean): void {
    if(this.confirmedTxs[transactionId]) {
      throw new Error(`Transaction ${transactionId} was already confirmed.`);
    }
    this.confirmedTxs[transactionId] = value;
  }

  private getOrCreateBeforeProof(contentId: string): Interfaces.IBeforeProofState {
    return this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
  }
}
