/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_hydrapublic_free(a: number): void;
export function hydrapublic_network(a: number, b: number): void;
export function hydrapublic_key(a: number, b: number): number;
export function hydrapublic_xpub(a: number, b: number): void;
export function hydrapublic_receive_keys(a: number): number;
export function hydrapublic_change_keys(a: number): number;
export function hydrapublic_keyByAddress(a: number, b: number, c: number): number;
export function __wbg_hydrasigner_free(a: number): void;
export function hydrasigner_new(a: number): number;
export function hydrasigner_signHydraTransaction(a: number, b: number): number;
export function __wbg_hydraplugin_free(a: number): void;
export function hydraplugin_rewind(a: number, b: number, c: number, d: number): void;
export function hydraplugin_get(a: number, b: number): number;
export function hydraplugin_public(a: number): number;
export function hydraplugin_priv(a: number, b: number, c: number): number;
export function selectiveDigestJson(a: number, b: number, c: number, d: number): void;
export function digestJson(a: number, b: number): void;
export function stringifyJson(a: number, b: number): void;
export function __wbg_morpheuspublickind_free(a: number): void;
export function morpheuspublickind_kind(a: number, b: number): void;
export function morpheuspublickind_count(a: number): number;
export function morpheuspublickind_key(a: number, b: number): number;
export function morpheuspublickind_did(a: number, b: number): number;
export function morpheuspublickind_keyById(a: number, b: number): number;
export function __wbg_hydraparameters_free(a: number): void;
export function hydraparameters_new(a: number, b: number, c: number): number;
export function __wbg_morpheusplugin_free(a: number): void;
export function morpheusplugin_rewind(a: number, b: number, c: number): void;
export function morpheusplugin_get(a: number): number;
export function morpheusplugin_public(a: number): number;
export function morpheusplugin_priv(a: number, b: number, c: number): number;
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
export function __wbg_hydraprivate_free(a: number): void;
export function hydraprivate_public(a: number): number;
export function hydraprivate_network(a: number, b: number): void;
export function hydraprivate_key(a: number, b: number): number;
export function hydraprivate_keyByPublicKey(a: number, b: number): number;
export function hydraprivate_xpub(a: number, b: number): void;
export function hydraprivate_xprv(a: number, b: number): void;
export function hydraprivate_receive_keys(a: number): number;
export function hydraprivate_change_keys(a: number): number;
export function hydraprivate_signHydraTransaction(a: number, b: number, c: number, d: number): number;
export function __wbg_hydratxbuilder_free(a: number): void;
export function hydratxbuilder_new(a: number, b: number): number;
export function hydratxbuilder_transfer(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function hydratxbuilder_vote(a: number, b: number, c: number, d: number, e: number): number;
export function hydratxbuilder_unvote(a: number, b: number, c: number, d: number, e: number): number;
export function hydratxbuilder_registerDelegate(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function __wbg_vault_free(a: number): void;
export function vault_create(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number): number;
export function vault_load(a: number): number;
export function vault_save(a: number): number;
export function vault_is_dirty(a: number): number;
export function vault_setDirty(a: number): void;
export function vault_unlock(a: number, b: number, c: number): number;
export function __wbg_morpheusprivate_free(a: number): void;
export function morpheusprivate_public(a: number): number;
export function morpheusprivate_personas(a: number): number;
export function morpheusprivate_keyByPublicKey(a: number, b: number): number;
export function morpheusprivate_keyById(a: number, b: number): number;
export function morpheusprivate_signDidOperations(a: number, b: number, c: number, d: number): number;
export function morpheusprivate_signWitnessRequest(a: number, b: number, c: number): number;
export function morpheusprivate_signWitnessStatement(a: number, b: number, c: number): number;
export function morpheusprivate_signClaimPresentation(a: number, b: number, c: number): number;
export function __wbg_did_free(a: number): void;
export function did_new(a: number, b: number): number;
export function did_prefix(a: number): void;
export function did_fromKeyId(a: number): number;
export function did_defaultKeyId(a: number): number;
export function did_toString(a: number, b: number): void;
export function __wbg_jwtbuilder_free(a: number): void;
export function jwtbuilder_new(): number;
export function jwtbuilder_withContentId(a: number, b: number): number;
export function jwtbuilder_sign(a: number, b: number, c: number): void;
export function __wbg_jwtparser_free(a: number): void;
export function jwtparser_new(a: number, b: number): number;
export function jwtparser_public_key(a: number): number;
export function jwtparser_created_at(a: number, b: number): void;
export function jwtparser_time_to_live(a: number, b: number): void;
export function __wbg_morpheusprivatekind_free(a: number): void;
export function morpheusprivatekind_kind(a: number, b: number): void;
export function morpheusprivatekind_count(a: number): number;
export function morpheusprivatekind_neuter(a: number): number;
export function morpheusprivatekind_key(a: number, b: number): number;
export function morpheusprivatekind_did(a: number, b: number): number;
export function morpheusprivatekind_keyByPublicKey(a: number, b: number): number;
export function __wbg_morpheuspublic_free(a: number): void;
export function morpheuspublic_personas(a: number): number;
export function morpheuspublic_keyById(a: number, b: number): number;
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
export function jsbip32_master(a: number, b: number, c: number): number;
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
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
