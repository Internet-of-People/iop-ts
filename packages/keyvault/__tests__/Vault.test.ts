import { Vault } from '../pkg';
import { PersistentVault } from '../src';

describe('Vault', () => {
  it('can be serialized/deserialized', () => {
    const vault = new Vault(PersistentVault.DEMO_PHRASE);
    expect(vault.profiles()).toHaveLength(0);

    vault.createId();
    expect(vault.profiles()).toHaveLength(1);

    vault.createId();
    expect(vault.profiles()).toHaveLength(2);
    expect(vault.profiles()).toStrictEqual(
      [ 'iezbeWGSY2dqcUBqT8K7R14xr', 'iez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );

    const vaultSerStr = vault.serialize();
    const vaultDeser = Vault.deserialize(vaultSerStr);

    expect(vaultDeser.profiles()).toStrictEqual(vault.profiles());
  });
});
