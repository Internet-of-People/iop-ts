import {unlinkSync} from "fs";
import {SignedMessage, Vault} from '../pkg';
import {PersistentVault} from "../src/PersistentVault";

const VAULT_FILE = "vault.json";

describe('PersistentVault', () => {
  let vault: PersistentVault;

  beforeAll( () => {
    const inMemoryVault = new Vault(PersistentVault.DEMO_PHRASE);
    vault = new PersistentVault(inMemoryVault, VAULT_FILE);
    vault.createDid();
    vault.createDid();
  });

  beforeEach( () => {
    vault = PersistentVault.loadFile(VAULT_FILE);
  });

  it('is persistent', () => {
    expect(vault.dids()).toHaveLength(2);
    expect(vault.dids()).toStrictEqual(
      ["IezbeWGSY2dqcUBqT8K7R14xr", "Iez25N5WZ1Q6TQpgpyYgiu9gTX"]
    );
  });

  it('can validate signatures', () => {
    const message = new Uint8Array([1,2,3,4,5]);
    const didOpt = vault.activeDid();
    expect(didOpt).toStrictEqual("Iez25N5WZ1Q6TQpgpyYgiu9gTX");
    const did = didOpt as string;
    const signedMessage = vault.sign(message, did);
    expect(signedMessage).toBeTruthy();
    expect( vault.validateSignature(signedMessage, did) ).toBe(true);
    expect( vault.validateSignature(signedMessage) ).toBe(true);

    const wrongMessage = new Uint8Array([1,2,255,4,5]);
    const wrongSignedMessage = new SignedMessage(signedMessage.public_key, wrongMessage, signedMessage.signature);
    expect( vault.validateSignature(wrongSignedMessage, did) ).toBe(false);
  });

  afterAll(() => {
    unlinkSync(VAULT_FILE);
  });
});
