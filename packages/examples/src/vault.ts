import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs'; // TODO choose an async fs implementation among the many
import { config } from 'xdg-portable';
import { Types, Crypto } from '@internet-of-people/sdk';

export const vaultPath = (): string => {
  return join(config(), '/prometheus/vault.dat');
};

export const save = async(state: Types.Crypto.IVaultState): Promise<void> => {
  const serialized = JSON.stringify(state);
  writeFileSync(vaultPath(), serialized);
};

export const loadVault = (): Crypto.XVault => {
  const serialized = readFileSync(vaultPath(), { encoding: 'utf-8' });
  return Crypto.XVault.load(JSON.parse(serialized), { save });
};

export const initDemoVault = async(): Promise<Crypto.XVault> => {
  const vault = await Crypto.XVault.create(Crypto.Seed.demoPhrase(), '', { save });
  return vault;
};

export const morpheus = async(): Promise<Crypto.IPlugin<Crypto.MorpheusPublic, Crypto.MorpheusPrivate>> => {
  const vault = loadVault();
  const m = await Crypto.morpheus(vault);
  return m;
};
