/* tslint:disable */
export const memory: WebAssembly.Memory;
export function __wbg_vault_free(a: number): void;
export function __wbg_signedmessage_free(a: number): void;
export function signedmessage_new(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function signedmessage_public_key(a: number, b: number): void;
export function signedmessage_message(a: number, b: number): void;
export function signedmessage_signature(a: number, b: number): void;
export function vault_new(a: number, b: number): number;
export function vault_serialize(a: number, b: number): void;
export function vault_deserialize(a: number, b: number): number;
export function vault_profiles(a: number, b: number): void;
export function vault_active_id(a: number, b: number): void;
export function vault_create_id(a: number, b: number): void;
export function vault_sign(a: number, b: number, c: number, d: number, e: number): number;
export function vault_validate_signature(a: number, b: number, c: number, d: number): number;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
