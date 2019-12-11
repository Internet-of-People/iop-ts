import {SignedMessage, Vault} from '../pkg';
import {PersistentVault, validateSignature} from '../src';

describe('Vault', () => {
  it('can be serialized/deserialized', () => {
    const vault = new Vault(PersistentVault.DEMO_PHRASE);
    expect(vault.profiles()).toHaveLength(0);

    vault.create_id();
    expect(vault.profiles()).toHaveLength(1);

    vault.create_id();
    expect(vault.profiles()).toHaveLength(2);
    expect(vault.profiles()).toStrictEqual(
      ['IezbeWGSY2dqcUBqT8K7R14xr', 'Iez25N5WZ1Q6TQpgpyYgiu9gTX']
    );

    const vaultSerStr = vault.serialize();
    const vaultDeser = Vault.deserialize(vaultSerStr);

    expect(vaultDeser.profiles()).toStrictEqual(vault.profiles());
  });
});
