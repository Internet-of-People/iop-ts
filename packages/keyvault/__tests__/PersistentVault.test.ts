import { unlinkSync } from 'fs';
import { KeyId, SignedMessage, Vault } from '../pkg';
import { PersistentVault } from '../src';

const VAULT_FILE = 'vault.json';

describe('PersistentVault', () => {
  let vault: PersistentVault;

  beforeAll(() => {
    const inMemoryVault = new Vault(PersistentVault.DEMO_PHRASE);
    vault = new PersistentVault(inMemoryVault, VAULT_FILE);
    vault.createId();
    vault.createId();
  });

  beforeEach(() => {
    vault = PersistentVault.loadFile(VAULT_FILE);
  });

  it('is persistent', () => {
    expect(vault.ids()).toHaveLength(2);
    expect(vault.ids().map((id) => {
      return id.toString();
    })).toStrictEqual(
      [ 'IezbeWGSY2dqcUBqT8K7R14xr', 'Iez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );
  });

  it('can validate signatures', () => {
    const message = new Uint8Array([ 1, 2, 3, 4, 5 ]);
    const idOpt = vault.activeId();
    expect(idOpt).toBeTruthy();
    const id = idOpt as KeyId;
    expect(id.toString()).toStrictEqual('Iez25N5WZ1Q6TQpgpyYgiu9gTX');
    const signedMessage = vault.sign(message, id);
    expect(signedMessage).toBeTruthy();
    expect(signedMessage.validateWithId(id)).toBe(true);
    expect(signedMessage.validate()).toBe(true);

    const wrongMessage = new Uint8Array([ 1, 2, 255, 4, 5 ]);
    const wrongSignedMessage = new SignedMessage(signedMessage.publicKey, wrongMessage, signedMessage.signature);
    expect(wrongSignedMessage.validateWithId(id)).toBe(false);
  });

  afterAll(() => {
    unlinkSync(VAULT_FILE);
  });
});
