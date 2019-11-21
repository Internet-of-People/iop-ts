use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    let msg = format!("Rust says: hello {}!", name);
    println!("Rust msg {}", msg);
    msg
}