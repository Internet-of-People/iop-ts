import { unlinkSync } from 'fs';
import { SignedBytes, Vault, Did } from '@internet-of-people/morpheus-crypto-wasm';
import { PersistentVault } from '../src';

const VAULT_FILE = 'vault.json';

describe('PersistentVault', () => {
  let vault: PersistentVault;

  beforeAll(() => {
    const inMemoryVault = new Vault(PersistentVault.DEMO_PHRASE);
    vault = new PersistentVault(inMemoryVault, VAULT_FILE);
    vault.createDid();
    vault.createDid();
  });

  beforeEach(() => {
    vault = PersistentVault.loadFile(VAULT_FILE);
  });

  it('is persistent', () => {
    expect(vault.keyIds()).toHaveLength(2);
    expect(vault.keyIds().map((id) => {
      return id.toString();
    })).toStrictEqual(
      [ 'iezbeWGSY2dqcUBqT8K7R14xr', 'iez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );
  });

  it('can validate signatures', () => {
    const message = new Uint8Array([ 1, 2, 3, 4, 5 ]);
    const didOpt = vault.activeDid();
    expect(didOpt).toBeTruthy();
    const did = didOpt as Did;
    expect(did.toString()).toStrictEqual('did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX');
    const signedMessage = vault.signDidOperations(did.defaultKeyId(), message);
    expect(signedMessage).toBeTruthy();
    expect(signedMessage.validate()).toBe(true);
    expect(signedMessage.publicKey.validateId(did.defaultKeyId())).toBe(true);

    const wrongMessage = new Uint8Array([ 1, 2, 255, 4, 5 ]);
    const wrongSignedMessage = new SignedBytes(signedMessage.publicKey, wrongMessage, signedMessage.signature);
    expect(wrongSignedMessage.validate()).toBe(false);
  });

  afterAll(() => {
    unlinkSync(VAULT_FILE);
  });
});
