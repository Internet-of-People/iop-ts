/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_morpheusstate_free(a: number): void;
export function morpheusstate_new(): number;
export function morpheusstate_is_corrupted(a: number): number;
export function morpheusstate_lastBlockHeight(a: number): number;
export function morpheusstate_isConfirmed(a: number, b: number, c: number): number;
export function morpheusstate_beforeProofExistsAt(a: number, b: number, c: number, d: number, e: number): number;
export function morpheusstate_beforeProofHistory(a: number, b: number, c: number): number;
export function morpheusstate_getTransactionHistory(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function morpheusstate_lastTxId(a: number, b: number, c: number, d: number): void;
export function morpheusstate_getDidDocumentAt(a: number, b: number, c: number, d: number, e: number): number;
export function morpheusstate_dryRun(a: number, b: number, c: number): void;
export function morpheusstate_blockApplying(a: number, b: number): void;
export function morpheusstate_applyTransaction(a: number, b: number, c: number, d: number): void;
export function morpheusstate_blockReverting(a: number, b: number): void;
export function morpheusstate_revertTransaction(a: number, b: number, c: number, d: number): void;
export function __wbg_diddocument_free(a: number): void;
export function __wbg_coeusstate_free(a: number): void;
export function coeusstate_new(): number;
export function coeusstate_resolveData(a: number, b: number): number;
export function coeusstate_getMetadata(a: number, b: number): number;
export function coeusstate_getChildren(a: number, b: number): number;
export function coeusstate_lastNonce(a: number, b: number, c: number): void;
export function coeusstate_applyTransaction(a: number, b: number, c: number, d: number): void;
export function coeusstate_revertTransaction(a: number, b: number, c: number, d: number): void;
export function coeusstate_blockApplying(a: number, b: number): void;
export function coeusstate_blockReverted(a: number, b: number): void;
export function coeusstate_is_corrupted(a: number): number;
export function coeusstate_version(a: number, b: number): void;
export function coeusstate_last_seen_height(a: number): number;
export function coeusstate_getTxnStatus(a: number, b: number, c: number): number;
export function selectiveDigestJson(a: number, b: number, c: number, d: number): void;
export function digestJson(a: number, b: number): void;
export function stringifyJson(a: number, b: number): void;
export function __wbg_coeustxbuilder_free(a: number): void;
export function coeustxbuilder_new(a: number, b: number): number;
export function coeustxbuilder_build(a: number, b: number, c: number, d: number, e: number): number;
export function __wbg_useroperation_free(a: number): void;
export function useroperation_register(a: number, b: number, c: number, d: number, e: number): number;
export function useroperation_update(a: number, b: number): number;
export function useroperation_renew(a: number, b: number): number;
export function useroperation_transfer(a: number, b: number): number;
export function useroperation_delete(a: number): number;
export function __wbg_did_free(a: number): void;
export function did_new(a: number, b: number): number;
export function did_prefix(a: number): void;
export function did_fromKeyId(a: number): number;
export function did_defaultKeyId(a: number): number;
export function did_toString(a: number, b: number): void;
export function __wbg_subtreepolicies_free(a: number): void;
export function subtreepolicies_new(): number;
export function subtreepolicies_withSchema(a: number, b: number): number;
export function subtreepolicies_withExpiration(a: number, b: number): number;
export function __wbg_price_free(a: number): void;
export function price_fee(a: number, b: number): void;
export function __wbg_jwtbuilder_free(a: number): void;
export function jwtbuilder_new(): number;
export function jwtbuilder_withContentId(a: number, b: number): number;
export function jwtbuilder_sign(a: number, b: number, c: number): void;
export function __wbg_jwtparser_free(a: number): void;
export function jwtparser_new(a: number, b: number): number;
export function jwtparser_public_key(a: number): number;
export function jwtparser_created_at(a: number, b: number): void;
export function jwtparser_time_to_live(a: number, b: number): void;
export function __wbg_principal_free(a: number): void;
export function principal_system(): number;
export function principal_publicKey(a: number): number;
export function principal_validateImpersonation(a: number, b: number): void;
export function __wbg_domainname_free(a: number): void;
export function domainname_new(a: number, b: number): number;
export function domainname_toString(a: number, b: number): void;
export function __wbg_signedbytes_free(a: number): void;
export function signedbytes_new(a: number, b: number, c: number, d: number): number;
export function signedbytes_publicKey(a: number): number;
export function signedbytes_content(a: number, b: number): void;
export function signedbytes_signature(a: number): number;
export function signedbytes_validate(a: number): number;
export function signedbytes_validateWithKeyId(a: number, b: number): number;
export function signedbytes_validateWithDidDoc(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function __wbg_signedjson_free(a: number): void;
export function signedjson_new(a: number, b: number, c: number): number;
export function signedjson_publicKey(a: number): number;
export function signedjson_content(a: number): number;
export function signedjson_signature(a: number): number;
export function signedjson_validate(a: number): number;
export function signedjson_validateWithKeyId(a: number, b: number): number;
export function signedjson_validateWithDidDoc(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function __wbg_validationissue_free(a: number): void;
export function validationissue_code(a: number): number;
export function validationissue_severity(a: number, b: number): void;
export function validationissue_reason(a: number, b: number): void;
export function __wbg_validationresult_free(a: number): void;
export function validationresult_status(a: number, b: number): void;
export function validationresult_messages(a: number, b: number): void;
export function __wbg_noncedbundlebuilder_free(a: number): void;
export function noncedbundlebuilder_new(): number;
export function noncedbundlebuilder_add(a: number, b: number): void;
export function noncedbundlebuilder_build(a: number, b: number, c: number): number;
export function __wbg_noncedbundle_free(a: number): void;
export function noncedbundle_price(a: number): number;
export function noncedbundle_sign(a: number, b: number): number;
export function noncedbundle_serialize(a: number, b: number): void;
export function __wbg_signedbundle_free(a: number): void;
export function signedbundle_new(a: number): number;
export function signedbundle_price(a: number): number;
export function signedbundle_verify(a: number): number;
export function __wbg_coeusasset_free(a: number): void;
export function coeusasset_new(a: number): number;
export function coeusasset_deserialize(a: number, b: number): number;
export function coeusasset_serialize(a: number, b: number): void;
export function coeusasset_fee(a: number, b: number): void;
export function coeusasset_toJson(a: number): number;
export function __wbg_bip44_free(a: number): void;
export function bip44_network(a: number, b: number, c: number): number;
export function __wbg_bip44coin_free(a: number): void;
export function bip44coin_node(a: number): number;
export function bip44coin_network(a: number, b: number): void;
export function bip44coin_account(a: number, b: number): number;
export function bip44coin_slip44(a: number): number;
export function bip44coin_bip32_path(a: number, b: number): void;
export function bip44coin_to_xprv(a: number, b: number): void;
export function __wbg_bip44account_free(a: number): void;
export function bip44account_node(a: number): number;
export function bip44account_network(a: number, b: number): void;
export function bip44account_chain(a: number, b: number): number;
export function bip44account_key(a: number, b: number): number;
export function bip44account_slip44(a: number): number;
export function bip44account_account(a: number): number;
export function bip44account_bip32_path(a: number, b: number): void;
export function bip44account_neuter(a: number): number;
export function bip44account_fromXprv(a: number, b: number, c: number, d: number, e: number): number;
export function bip44account_to_xprv(a: number, b: number): void;
export function __wbg_bip44publicaccount_free(a: number): void;
export function bip44publicaccount_node(a: number): number;
export function bip44publicaccount_network(a: number, b: number): void;
export function bip44publicaccount_chain(a: number, b: number): number;
export function bip44publicaccount_key(a: number, b: number): number;
export function bip44publicaccount_slip44(a: number): number;
export function bip44publicaccount_account(a: number): number;
export function bip44publicaccount_bip32_path(a: number, b: number): void;
export function bip44publicaccount_fromXpub(a: number, b: number, c: number, d: number, e: number): number;
export function bip44publicaccount_to_xpub(a: number, b: number): void;
export function __wbg_bip44subaccount_free(a: number): void;
export function bip44subaccount_node(a: number): number;
export function bip44subaccount_network(a: number, b: number): void;
export function bip44subaccount_key(a: number, b: number): number;
export function bip44subaccount_slip44(a: number): number;
export function bip44subaccount_account(a: number): number;
export function bip44subaccount_change(a: number): number;
export function bip44subaccount_bip32_path(a: number, b: number): void;
export function bip44subaccount_neuter(a: number): number;
export function bip44subaccount_fromXprv(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function bip44subaccount_to_xprv(a: number, b: number): void;
export function __wbg_bip44publicsubaccount_free(a: number): void;
export function bip44publicsubaccount_node(a: number): number;
export function bip44publicsubaccount_network(a: number, b: number): void;
export function bip44publicsubaccount_key(a: number, b: number): number;
export function bip44publicsubaccount_slip44(a: number): number;
export function bip44publicsubaccount_account(a: number): number;
export function bip44publicsubaccount_change(a: number): number;
export function bip44publicsubaccount_bip32_path(a: number, b: number): void;
export function bip44publicsubaccount_fromXpub(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function bip44publicsubaccount_to_xpub(a: number, b: number): void;
export function __wbg_bip44key_free(a: number): void;
export function bip44key_node(a: number): number;
export function bip44key_network(a: number, b: number): void;
export function bip44key_privateKey(a: number): number;
export function bip44key_slip44(a: number): number;
export function bip44key_account(a: number): number;
export function bip44key_change(a: number): number;
export function bip44key_key(a: number): number;
export function bip44key_bip32_path(a: number, b: number): void;
export function bip44key_neuter(a: number): number;
export function bip44key_to_wif(a: number, b: number): void;
export function __wbg_bip44publickey_free(a: number): void;
export function bip44publickey_node(a: number): number;
export function bip44publickey_network(a: number, b: number): void;
export function bip44publickey_publicKey(a: number): number;
export function bip44publickey_keyId(a: number): number;
export function bip44publickey_slip44(a: number): number;
export function bip44publickey_account(a: number): number;
export function bip44publickey_change(a: number): number;
export function bip44publickey_key(a: number): number;
export function bip44publickey_bip32_path(a: number, b: number): void;
export function bip44publickey_to_p2pkh_addr(a: number, b: number): void;
export function __wbg_keyid_free(a: number): void;
export function keyid_new(a: number, b: number): number;
export function keyid_fromSecp(a: number): number;
export function keyid_prefix(a: number): void;
export function keyid_toString(a: number, b: number): void;
export function __wbg_secpkeyid_free(a: number): void;
export function secpkeyid_fromAddress(a: number, b: number, c: number, d: number): number;
export function encrypt(a: number, b: number, c: number, d: number, e: number): void;
export function decrypt(a: number, b: number, c: number, d: number, e: number): void;
export function __wbg_seed_free(a: number): void;
export function seed_new(a: number, b: number): number;
export function seed_demoPhrase(a: number): void;
export function seed_legacyPassword(a: number): void;
export function seed_toBytes(a: number, b: number): void;
export function validateNetworkName(a: number, b: number): number;
export function __wbg_morpheus_free(a: number): void;
export function morpheus_root(a: number): number;
export function __wbg_morpheusroot_free(a: number): void;
export function morpheusroot_bip32_path(a: number, b: number): void;
export function morpheusroot_personas(a: number): number;
export function __wbg_morpheuskind_free(a: number): void;
export function morpheuskind_bip32_path(a: number, b: number): void;
export function morpheuskind_kind(a: number, b: number): void;
export function morpheuskind_key(a: number, b: number): number;
export function __wbg_morpheusprivatekey_free(a: number): void;
export function morpheusprivatekey_bip32_path(a: number, b: number): void;
export function morpheusprivatekey_kind(a: number, b: number): void;
export function morpheusprivatekey_idx(a: number): number;
export function morpheusprivatekey_neuter(a: number): number;
export function morpheusprivatekey_privateKey(a: number): number;
export function __wbg_morpheuspublickey_free(a: number): void;
export function morpheuspublickey_bip32_path(a: number, b: number): void;
export function morpheuspublickey_kind(a: number, b: number): void;
export function morpheuspublickey_idx(a: number): number;
export function morpheuspublickey_publicKey(a: number): number;
export function __wbg_bip32_free(a: number): void;
export function bip32_master(a: number, b: number, c: number): number;
export function __wbg_bip32node_free(a: number): void;
export function bip32node_network(a: number, b: number): void;
export function bip32node_path(a: number, b: number): void;
export function bip32node_deriveNormal(a: number, b: number): number;
export function bip32node_deriveHardened(a: number, b: number): number;
export function bip32node_privateKey(a: number): number;
export function bip32node_neuter(a: number): number;
export function bip32node_toXprv(a: number, b: number, c: number, d: number): void;
export function bip32node_toWif(a: number, b: number, c: number, d: number): void;
export function __wbg_bip32publicnode_free(a: number): void;
export function bip32publicnode_network(a: number, b: number): void;
export function bip32publicnode_path(a: number, b: number): void;
export function bip32publicnode_deriveNormal(a: number, b: number): number;
export function bip32publicnode_publicKey(a: number): number;
export function bip32publicnode_keyId(a: number): number;
export function bip32publicnode_toXpub(a: number, b: number, c: number, d: number): void;
export function bip32publicnode_toP2pkh(a: number, b: number, c: number, d: number): void;
export function __wbg_publickey_free(a: number): void;
export function publickey_new(a: number, b: number): number;
export function publickey_fromSecp(a: number): number;
export function publickey_prefix(a: number): void;
export function publickey_keyId(a: number): number;
export function publickey_validateId(a: number, b: number): number;
export function publickey_validateEcdsa(a: number, b: number, c: number, d: number): number;
export function publickey_toString(a: number, b: number): void;
export function __wbg_secppublickey_free(a: number): void;
export function secppublickey_new(a: number, b: number): number;
export function secppublickey_keyId(a: number): number;
export function secppublickey_arkKeyId(a: number): number;
export function secppublickey_validateId(a: number, b: number): number;
export function secppublickey_validateArkId(a: number, b: number): number;
export function secppublickey_validateEcdsa(a: number, b: number, c: number, d: number): number;
export function secppublickey_toString(a: number, b: number): void;
export function __wbg_privatekey_free(a: number): void;
export function privatekey_fromSecp(a: number): number;
export function privatekey_publicKey(a: number): number;
export function privatekey_signEcdsa(a: number, b: number, c: number): number;
export function __wbg_secpprivatekey_free(a: number): void;
export function secpprivatekey_fromArkPassphrase(a: number, b: number): number;
export function secpprivatekey_fromWif(a: number, b: number, c: number, d: number): number;
export function secpprivatekey_toWif(a: number, b: number, c: number, d: number): void;
export function secpprivatekey_publicKey(a: number): number;
export function secpprivatekey_signEcdsa(a: number, b: number, c: number): number;
export function __wbg_bip39_free(a: number): void;
export function bip39_new(a: number, b: number): number;
export function bip39_generate(a: number): number;
export function bip39_entropy(a: number, b: number, c: number): number;
export function bip39_validatePhrase(a: number, b: number, c: number): void;
export function bip39_listWords(a: number, b: number, c: number, d: number): void;
export function bip39_phrase(a: number, b: number, c: number): number;
export function __wbg_bip39phrase_free(a: number): void;
export function bip39phrase_password(a: number, b: number, c: number): number;
export function bip39phrase_phrase(a: number, b: number): void;
export function __wbg_signature_free(a: number): void;
export function signature_new(a: number, b: number): number;
export function signature_fromSecp(a: number): number;
export function signature_prefix(a: number): void;
export function signature_toString(a: number, b: number): void;
export function __wbg_secpsignature_free(a: number): void;
export function secpsignature_fromDer(a: number, b: number): number;
export function secpsignature_toDer(a: number, b: number): void;
export function secpsignature_toString(a: number, b: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
