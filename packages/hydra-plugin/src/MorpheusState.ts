import { BeforeProofState, IBeforeProofState } from "@internet-of-people/did-manager";

export interface IMorpheusOperations {
  registerBeforeProof(contentId: string, height: number): void;
  revokeBeforeProof(contentId: string, height: number): void;
}

export interface IMorpheusState {

  readonly apply: IMorpheusOperations;
  readonly revert: IMorpheusOperations;
  beforeProofExistsAt(contentId: string, height: number): boolean;
}

export class MorpheusState implements IMorpheusState {

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
  }

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
  }
  private beforeProofs = new Map<string, IBeforeProofState>();

  public beforeProofExistsAt(contentId: string, height: number): boolean {
    const beforeProofState = this.beforeProofs.get(contentId);
    return beforeProofState !== undefined && beforeProofState.existsAt(height);
  }
}
