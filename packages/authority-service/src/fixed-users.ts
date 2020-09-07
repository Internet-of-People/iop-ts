import { PubkeyChecker } from './jwt-auth';

export class FixedUsers {
  private readonly pubKeys: string[];

  public constructor(pubKeys: string) {
    this.pubKeys = pubKeys.split(',').map((s) => {
      return s.trim();
    });
  }

  public get checker(): PubkeyChecker {
    return (pubKey: string): boolean => {
      return this.pubKeys.includes(pubKey);
    };
  }
}
