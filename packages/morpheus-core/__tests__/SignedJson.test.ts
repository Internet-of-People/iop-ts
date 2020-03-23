import { SignedJson, Vault, PersistentVault, SignedBytes } from '../src';
import cloneDeep from 'lodash.clonedeep';

const request = {
  'processId': 'cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg',
  'claimant': 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr#0',
  'claim': {
    'subject': 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr',
    'content': {
      'address': '6 Unter den Linden, Berlin, Germany',
      'dateOfBirth': '16/02/2002',
      'placeOfBirth': {
        'city': 'Berlin',
        'country': 'Germany',
      },
    },
  },
  'evidence': {
    'photo': 'HUGE SELFIE',
  },
  'nonce': 'u1U9fIy/AE2sIA1Xi3523NzSsMnJrVU3Tv+q4rlGyhluQ',
};

// Calculated with JsonUtils.digest from '@internet-of-people/sdk'
const requestId = 'cjuzC-XxgzNMwYXtw8aMIAeS2Xjlw1hlSNKTvVtUwPuyYo';

describe('SignedJson', () => {
  let vault: Vault;

  beforeEach(() => {
    vault = new Vault(PersistentVault.DEMO_PHRASE);
    vault.createDid();
  });

  it('validation passes', () => {
    const [keyId] = vault.keyIds();
    const signedJson = vault.signWitnessRequest(keyId, request);

    expect(signedJson.validate()).toBeTruthy();
    expect(signedJson.validateWithKeyId(keyId)).toBeTruthy();
  });

  it('validation fails with tempered content', () => {
    const [keyId] = vault.keyIds();
    const originalSignedJson = vault.signWitnessRequest(keyId, request);
    const temperedRequest = cloneDeep(request);
    temperedRequest.nonce = `U${ request.nonce.substr(1)}`;

    const temperedSignedJson = new SignedJson(
      originalSignedJson.publicKey,
      temperedRequest,
      originalSignedJson.signature,
    );

    expect(temperedSignedJson.validate()).toBeFalsy();
    expect(temperedSignedJson.validateWithKeyId(keyId)).toBeFalsy();
  });

  it('validation passes with masked content', () => {
    const [keyId] = vault.keyIds();
    const signedJson = vault.signWitnessRequest(keyId, request);

    const collapsedSignedJson = new SignedJson(
      signedJson.publicKey,
      requestId,
      signedJson.signature,
    );

    expect(collapsedSignedJson.validate()).toBeTruthy();
    expect(collapsedSignedJson.validateWithKeyId(keyId)).toBeTruthy();

    const signedBytes = new SignedBytes(
      signedJson.publicKey,
      Uint8Array.from(Buffer.from(requestId, 'utf-8')),
      signedJson.signature,
    );

    expect(signedBytes.validate()).toBeTruthy();
    expect(signedBytes.publicKey.validateId(keyId)).toBeTruthy(); // no validateId on SignedBytes
  });
});
