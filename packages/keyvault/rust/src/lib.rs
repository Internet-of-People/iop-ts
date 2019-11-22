use wasm_bindgen::prelude::*;

use keyvault::{multicipher::MPublicKey, PublicKey};

#[wasm_bindgen]
pub fn keyid(pubkey_str: &str) -> String {
    let pubkey: MPublicKey = match pubkey_str.parse() {
        Ok(key) => key,
        Err(e) => return format!("Failed to parse public key: {}", e.to_string()),
    };
    pubkey.key_id().to_string()
}
