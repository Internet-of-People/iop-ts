import { join } from 'path';
import { config } from 'xdg-portable';
import { Crypto } from '@internet-of-people/sdk';

export const vaultPath = (): string => {
  return join(config(), '/prometheus/vault.dat');
};

export const loadVault = (): Crypto.PersistentVault => {
  return Crypto.PersistentVault.loadFile(vaultPath());
};

export const initDemoVault = (): Crypto.PersistentVault => {
  return Crypto.PersistentVault.fromSeedPhrase(Crypto.PersistentVault.DEMO_PHRASE, vaultPath());
};
