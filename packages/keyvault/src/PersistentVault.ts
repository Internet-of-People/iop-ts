import { readFileSync, writeFileSync } from 'fs';
import { KeyId, SignedMessage, Vault } from '../pkg';
import * as Interfaces from './interfaces';


export class PersistentVault implements Interfaces.IVault {
  // TODO this probably should come from Rust with some Wasm binding
  /* eslint max-len: 0 */
  public static readonly DEMO_PHRASE: string = 'include pear escape sail spy orange cute despair witness trouble sleep torch wire burst unable brass expose fiction drift clock duck oxygen aerobic already';
  private static readonly ENCODING: string = 'utf8';
  private readonly vault: Vault;
  private readonly path: string;

  public constructor(vault: Vault, vaultPath: string) {
    this.vault = vault;
    this.path = vaultPath;
  }

  public static fromSeedPhrase(seedPhrase: string, vaultPath: string): PersistentVault {
    const vault = new Vault(seedPhrase);
    return new PersistentVault(vault, vaultPath);
  }

  public static loadFile(vaultPath: string): PersistentVault {
    const serializedVault = readFileSync(vaultPath, PersistentVault.ENCODING);
    const vault = Vault.deserialize(serializedVault);
    return new PersistentVault(vault, vaultPath);
  }

  public activeId(): KeyId | undefined {
    return this.vault.activeId();
  }

  public createId(): KeyId {
    const id = this.vault.createId();
    this.saveFile();
    return id;
  }

  public ids(): KeyId[] {
    return this.vault.profiles();
  }

  public sign(message: Uint8Array, id: KeyId): SignedMessage {
    return this.vault.sign(id, message);
  }

  private saveFile(): void {
    const serializedVault = this.vault.serialize();
    writeFileSync(this.path, serializedVault, PersistentVault.ENCODING);
    // console.log("Saved vault to", this.path);
  }
}
