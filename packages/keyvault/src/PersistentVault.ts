import {readFileSync, writeFileSync} from 'fs';
import {SignedMessage, Vault} from '../pkg';
import * as Interfaces from './interfaces';

export class PersistentVault implements Interfaces.IVault {
  // TODO this probably should come from Rust with some Wasm binding
  public static readonly DEMO_PHRASE = 'include pear escape sail spy orange cute despair witness trouble sleep torch wire burst unable brass expose fiction drift clock duck oxygen aerobic already';

  public static fromSeedPhrase(seedPhrase: string, vaultPath: string): PersistentVault {
    const vault = new Vault(seedPhrase);
    return new PersistentVault(vault, vaultPath);
  }

  public static loadFile(vaultPath: string): PersistentVault {
    const serializedVault = readFileSync(vaultPath, PersistentVault.ENCODING);
    const vault = Vault.deserialize(serializedVault);
    return new PersistentVault(vault, vaultPath);
  }

  private static readonly ENCODING = 'utf8';
  private readonly vault: Vault;
  private readonly path: string;

  constructor(vault: Vault, vaultPath: string) {
    this.vault = vault;
    this.path = vaultPath;
  }

  public activeDid(): string | undefined {
    return this.vault.active_id();
  }

  public createDid(): string {
    const did = this.vault.create_id();
    this.saveFile();
    return did;
  }

  public dids(): string[] {
    return this.vault.profiles();
  }

  public sign(message: Uint8Array, did: string): SignedMessage {
    return this.vault.sign(did, message);
  }

  public validateSignature(signedMessage: SignedMessage, did?: string): boolean {
    return this.vault.validate_signature(did, signedMessage);
  }

  private saveFile(): void {
    const serializedVault = this.vault.serialize();
    writeFileSync(this.path, serializedVault, PersistentVault.ENCODING);
    // console.log("Saved vault to", this.path);
  }
}
