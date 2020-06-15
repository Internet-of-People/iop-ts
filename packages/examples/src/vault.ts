import { join } from 'path';
import { promises as asyncFs } from 'fs';
import { config } from 'xdg-portable';
import { Crypto } from '@internet-of-people/sdk';

export const unlockPassword = 'correct horse battery staple';

export const vaultPath = (): string => {
  return join(config(), '/prometheus/vault.dat');
};

export const saveVault = async(vault: Crypto.Vault): Promise<void> => {
  const serialized = JSON.stringify(vault.save());
  await asyncFs.writeFile(vaultPath(), serialized, { encoding: 'utf-8' });
};

export const loadVault = async(): Promise<Crypto.Vault> => {
  const serialized = await asyncFs.readFile(vaultPath(), { encoding: 'utf-8' });
  return Crypto.Vault.load(JSON.parse(serialized));
};

export const initDemoVault = async(): Promise<Crypto.Vault> => {
  const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPassword);
  Crypto.MorpheusPlugin.rewind(vault, unlockPassword);
  return vault;
};
