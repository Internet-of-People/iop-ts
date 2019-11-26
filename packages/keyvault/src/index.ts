import { readFileSync, writeFileSync } from 'fs'
import { Vault } from '../pkg';

console.log("Initializing vault");
let vault;
try {
  const serializedVault = readFileSync("vault.json", "utf8");
  vault = Vault.deserialize(serializedVault);
}
catch (e) {
  console.log("Failed to load existing vault", e);
  console.log("Creating brand new vault");
  // TODO do not hardwire demo phrase, do the usual play somewhere: generate, show, ensure it was written
  vault = new Vault("include pear escape sail spy orange cute despair witness trouble sleep torch wire burst unable brass expose fiction drift clock duck oxygen aerobic already");
}

console.log("Vault initialized, creating new identity");
const id = vault.create_id();
console.log("Created identity:", id);

const messageBytes = new Uint8Array([42, 20, 20, 77]);
const signedMessage = vault.sign(id, messageBytes);
console.log("Signed message:", signedMessage);

const serializedVault = vault.serialize();
writeFileSync("vault.json", serializedVault, "utf8");

// "Pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6"
// "IezbeWGSY2dqcUBqT8K7R14xr"
