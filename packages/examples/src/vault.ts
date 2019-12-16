import { PersistentVault } from '@internet-of-people/keyvault';

// TODO Use something like 'xdg-portable' or 'cone' or 'util-configdir'
export const VAULT_FILENAME = '/home/wigy/.config/prometheus/vault.dat';

export const loadVault = (): PersistentVault => {
  return PersistentVault.loadFile(VAULT_FILENAME);
};

export const initDemoVault = (): PersistentVault => {
  return PersistentVault.fromSeedPhrase(PersistentVault.DEMO_PHRASE, VAULT_FILENAME);
};
