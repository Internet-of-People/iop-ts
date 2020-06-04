import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs'; // TODO choose an async fs implementation among the many
import { config } from 'xdg-portable';
import { Types, Crypto } from '@internet-of-people/sdk';
import { MorpheusPublic, MorpheusPrivate } from '../../morpheus-crypto/dist';

export const vaultPath = (): string => {
  return join(config(), '/prometheus/vault.dat');
};

export const save = async (state: Types.Crypto.IVaultState): Promise<void> => {
  let serialized = JSON.stringify(state);
  writeFileSync(vaultPath(), serialized);
}

export const loadVault = (): Crypto.XVault => {
  let serialized = readFileSync(vaultPath(), { encoding: 'utf-8' });
  return Crypto.XVault.load(JSON.parse(serialized), { save });
};

export const initDemoVault = (): Promise<Crypto.XVault> => {
  return Crypto.XVault.create(Crypto.Seed.demoPhrase(), '', { save });
};

export const morpheus = async (): Promise<Crypto.IPlugin<MorpheusPublic, MorpheusPrivate>> => {
  const vault = loadVault();
  return await Crypto.morpheus(vault);
}
