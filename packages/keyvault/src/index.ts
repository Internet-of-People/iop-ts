import { DidVault } from './DidVault';

const vaultPath = process.argv[2] || "vault.json";

let vault;
try {
  console.log("Initializing vault from", vaultPath);
  vault = DidVault.loadFile(vaultPath);
}
catch (e) {
  console.log("Failed to load existing vault, creating new one");
  // TODO do not hardwire demo phrase, do the usual play somewhere: generate, show, ensure it was written
  vault = DidVault.fromSeedPhrase(DidVault.DEMO_PHRASE, vaultPath);
}

let did;
try {
  console.log("Vault initialized, fetching identities");
  const active = vault.activeDid();
  if (!active) {
    throw new Error("No identities found in vault");
  }
  did = active;
}
catch (e) {
  console.log("No identity found, creating one");
  did = vault.createDid();
}

console.log("Active identity is:", did);

const messageBytes = new Uint8Array([42, 20, 20, 77]);
const signedMessage = vault.sign(did, messageBytes);
console.log("Signed message:", signedMessage);

// "Pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6"
// "IezbeWGSY2dqcUBqT8K7R14xr"
