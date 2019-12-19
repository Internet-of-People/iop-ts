import { join } from 'path';
import { config } from 'xdg-portable';
import { PersistentVault } from '@internet-of-people/keyvault';

export const vaultPath = (): string => {
  return join(config(), '/prometheus/vault.dat');
};

export const loadVault = (): PersistentVault => {
  return PersistentVault.loadFile(vaultPath());
};

export const initDemoVault = (): PersistentVault => {
  return PersistentVault.fromSeedPhrase(PersistentVault.DEMO_PHRASE, vaultPath());
};
