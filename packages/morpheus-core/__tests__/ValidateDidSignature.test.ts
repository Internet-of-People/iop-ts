import { KeyId, PersistentVault, Vault } from "@internet-of-people/keyvault";
import { SignedString } from '../src';

describe('Did signatures', () => {
  it('can be validated', () => {
    const vault = new Vault(PersistentVault.DEMO_PHRASE);
    expect(vault.profiles()).toHaveLength(0);

    vault.createId();
    expect(vault.profiles()).toHaveLength(1);

    vault.createId();
    expect(vault.profiles()).toHaveLength(2);
    expect(vault.profiles()).toStrictEqual(
      [ 'iezbeWGSY2dqcUBqT8K7R14xr', 'iez25N5WZ1Q6TQpgpyYgiu9gTX' ],
    );

    const activeId = vault.activeId();
    if (activeId === undefined) {
      throw new Error("Implementation error: vault with two checked keys has undefined activeId");
    }
    expect(activeId.toString()).toStrictEqual('iez25N5WZ1Q6TQpgpyYgiu9gTX');
    const messageToSign = new Uint8Array([ 1, 2, 3, 4, 5 ]);
    const signedMessage = vault.sign(activeId, messageToSign);

    const didDocument = "TODO"; // TODO
    const signedString = SignedString.from(signedMessage);
    expect(() => signedString.validateWithDid(didDocument, -42, -1)).toThrowError();
    // TODO
    // const isValid = signedString.validateWithDid(didDocument);
    // expect(isValid).toBeTruthy();
  });
});
