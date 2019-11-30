import { Interfaces, MorpheusTransaction } from "@internet-of-people/did-manager";

const { Operations: { BeforeProof: { State: { BeforeProofState } } } } = MorpheusTransaction;

export interface IMorpheusOperations {
  registerBeforeProof(contentId: string, height: number): void;
  revokeBeforeProof(contentId: string, height: number): void;
}

export interface IMorpheusQueries {
  beforeProofExistsAt(contentId: string, height: number): boolean;
}

export interface IMorpheusState {
  readonly query: IMorpheusQueries;
  readonly apply: IMorpheusOperations;
  readonly revert: IMorpheusOperations;
}

export class MorpheusState implements IMorpheusState {
  public readonly query: IMorpheusQueries = {
    beforeProofExistsAt: (contentId: string, height: number): boolean => {
      const beforeProofState = this.beforeProofs.get(contentId);
      return beforeProofState !== undefined && beforeProofState.query.existsAt(height);
    }
  };

  public readonly apply: IMorpheusOperations = {
    registerBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
      beforeProof.apply.register(height);
      this.beforeProofs.set(contentId, beforeProof);
    },
    revokeBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
      beforeProof.apply.revoke(height);
      this.beforeProofs.set(contentId, beforeProof);
    },
  };

  public readonly revert: IMorpheusOperations = {
    registerBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
      beforeProof.revert.register(height);
      this.beforeProofs.set(contentId, beforeProof);
    },
    revokeBeforeProof: (contentId: string, height: number) => {
      const beforeProof = this.beforeProofs.get(contentId) || new BeforeProofState(contentId);
      beforeProof.revert.revoke(height);
      this.beforeProofs.set(contentId, beforeProof);
    },
  };

  private beforeProofs = new Map<string, Interfaces.IBeforeProofState>();
}
