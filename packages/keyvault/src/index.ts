import { readFileSync, writeFileSync } from 'fs'
import { Vault } from '../pkg';

const vaultPath = process.argv[2] || "vault.json";

console.log("Initializing vault from", vaultPath);
let vault;
try {
  const serializedVault = readFileSync(vaultPath, "utf8");
  vault = Vault.deserialize(serializedVault);
}
catch (e) {
  console.log("Failed to load existing vault, creating new one");
  // TODO do not hardwire demo phrase, do the usual play somewhere: generate, show, ensure it was written
  vault = new Vault("include pear escape sail spy orange cute despair witness trouble sleep torch wire burst unable brass expose fiction drift clock duck oxygen aerobic already");
}

let id;
try {
  console.log("Vault initialized, fetching identities");
  const active = vault.active_id();
  if (!active) {
    throw new Error("No identities found in vault");
  }
  id = active;
}
catch (e) {
  console.log("No identity found, creating one");
  id = vault.create_id();

  const serializedVault = vault.serialize();
  writeFileSync(vaultPath, serializedVault, "utf8");
  console.log("Saved vault to", vaultPath);
}

console.log("Active identity is:", id);

const messageBytes = new Uint8Array([42, 20, 20, 77]);
const signedMessage = vault.sign(id, messageBytes);
console.log("Signed message:", signedMessage);

// "Pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6"
// "IezbeWGSY2dqcUBqT8K7R14xr"
