import { readFileSync, writeFileSync } from 'fs';
import { Did, KeyId, SignedBytes, Vault } from '@internet-of-people/morpheus-crypto-wasm';
import { IVault } from './types';


export class PersistentVault implements IVault {
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

  public activeDid(): Did | undefined {
    return this.vault.activeDid();
  }

  public createDid(): Did {
    const id = this.vault.createDid();
    this.saveFile();
    return id;
  }

  public keyIds(): KeyId[] {
    return this.vault.keyIds();
  }

  public dids(): Did[] {
    return this.vault.dids();
  }

  public signDidOperations(id: KeyId, message: Uint8Array): SignedBytes {
    return this.vault.signDidOperations(id, message);
  }

  private saveFile(): void {
    const serializedVault = this.vault.serialize();
    writeFileSync(this.path, serializedVault, PersistentVault.ENCODING);
    // console.log("Saved vault to", this.path);
  }
}
