import {readFileSync, writeFileSync} from "fs";
import {Vault} from "../pkg";

export class DidVault
{
  // TODO this probably should come from Rust with some Wasm binding
  public static DEMO_PHRASE = "include pear escape sail spy orange cute despair witness trouble sleep torch wire burst unable brass expose fiction drift clock duck oxygen aerobic already";

  public static fromSeedPhrase(seedPhrase: string, vaultPath: string): DidVault {
    const vault = new Vault(seedPhrase);
    return new DidVault(vault, vaultPath);
  }

  public static loadFile(vaultPath: string): DidVault {
    const serializedVault = readFileSync(vaultPath, DidVault.ENCODING);
    const vault = Vault.deserialize(serializedVault);
    return new DidVault(vault, vaultPath);
  }

  protected static ENCODING = "utf8";



  protected vault: Vault;
  protected path: string;

  constructor(vault: Vault, vaultPath: string) {
    this.vault = vault;
    this.path = vaultPath;
  }

  // TODO return something like "string | null"
  public activeDid(): any {
    return this.vault.active_id();
  }

  public createDid(): string {
    const did = this.vault.create_id();
    this.saveFile();
    return did;
  }

  public sign(did: string, message: Uint8Array): object {
    return this.vault.sign(did, message)
  }

  public validateSignature(did: string | undefined, signedMessage: object): boolean {
    return this.vault.validate_signature(did, signedMessage);
  }

  private saveFile(): void {
    const serializedVault = this.vault.serialize();
    writeFileSync(this.path, serializedVault, DidVault.ENCODING);
    // console.log("Saved vault to", this.path);
  }
}