import { Vault } from '@internet-of-people/morpheus-crypto-wasm';
import { PersistentVault } from '../src';

describe('Vault', () => {
  it('can be serialized/deserialized', () => {
    const vault = new Vault(PersistentVault.DEMO_PHRASE);
    expect(vault.dids()).toHaveLength(0);

    vault.createDid();
    expect(vault.dids()).toHaveLength(1);

    vault.createDid();
    expect(vault.dids()).toHaveLength(2);
    expect(vault.keyIds().map((id) => {
      return id.toString();
    })).toStrictEqual(
      [ 'iezbeWGSY2dqcUBqT8K7R14xr', 'iez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );
    expect(vault.dids().map((id) => {
      return id.toString();
    })).toStrictEqual(
      [ 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr', 'did:morpheus:ez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );

    const vaultSerStr = vault.serialize();
    const vaultDeser = Vault.deserialize(vaultSerStr);

    expect(vaultDeser.keyIds().map((id) => {
      return id.toString();
    })).toStrictEqual(vault.keyIds().map((id) => {
      return id.toString();
    }));
  });
});
