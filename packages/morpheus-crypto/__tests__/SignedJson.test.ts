// import cloneDeep from 'lodash.clonedeep';

// import {
//   digestJson,
//   selectiveDigestJson,
//   Vault,
//   SignedBytes,
//   SignedJson,
//   Types,
//   Seed,
//   Morpheus,
//   MorpheusPrivate,
//   MorpheusPublic
// } from '../src';

import { digestJson, selectiveDigestJson } from '../src';

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

const requestId = digestJson(request);

describe('SignedJson', () => {
  // let signer: MorpheusPrivate;
  // let mPub: MorpheusPublic;

  // beforeEach(async() => {
  //   const unlockPassword = '';
  //   const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
  //   Morpheus.rewind(vault, unlockPassword);
  //   const m = Morpheus.get(vault);
  //   signer = m.priv(unlockPassword);
  //   mPub = m.pub;
  // });

  it('digesting works', () => {
    expect(requestId).toStrictEqual('cjuzC-XxgzNMwYXtw8aMIAeS2Xjlw1hlSNKTvVtUwPuyYo');

    const digestedRequest = selectiveDigestJson(request, '.evidence , .claim.subject');
    expect(digestedRequest).toStrictEqual(
      '{' +
        '"claim":{' +
          '"content":"cjub8nDXTl3S-6052q4P4FCSAYeuVBRQm8lTDQZuPyk44E",' +
          '"subject":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr"' +
        '},' +
        '"claimant":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr#0",' +
        '"evidence":{"photo":"HUGE SELFIE"},' +
        '"nonce":"u1U9fIy/AE2sIA1Xi3523NzSsMnJrVU3Tv+q4rlGyhluQ",' +
        '"processId":"cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg"' +
      '}');
  });

  it.skip('validation passes', () => {
    // const [keyId] = mPub.personas.keyIds();
    // const signedJson = signer.signWitnessRequest(keyId, request);

    // expect(signedJson.validate()).toBeTruthy();
    // expect(signedJson.validateWithKeyId(keyId)).toBeTruthy();
  });

  it.skip('validation fails with tampered content', () => {
    // const [keyId] = mPub.personas.keyIds();
    // const originalSignedJson = signer.signWitnessRequest(keyId, request);
    // const tamperedRequest = cloneDeep(request);
    // tamperedRequest.nonce = `U${ request.nonce.substr(1)}`;

    // const tamperedSignedJson = new SignedJson(
    //   originalSignedJson.publicKey,
    //   tamperedRequest,
    //   originalSignedJson.signature,
    // );

    // expect(tamperedSignedJson.validate()).toBeFalsy();
    // expect(tamperedSignedJson.validateWithKeyId(keyId)).toBeFalsy();
  });

  it.skip('validation passes with digested content', () => {
    // const [keyId] = mPub.personas.keyIds();
    // const signedJson = signer.signWitnessRequest(keyId, request);

    // const collapsedSignedJson = new SignedJson(
    //   signedJson.publicKey,
    //   requestId,
    //   signedJson.signature,
    // );

    // expect(collapsedSignedJson.validate()).toBeTruthy();
    // expect(collapsedSignedJson.validateWithKeyId(keyId)).toBeTruthy();

    // const signedBytes = new SignedBytes(
    //   signedJson.publicKey,
    //   Uint8Array.from(Buffer.from(requestId, 'utf-8')),
    //   signedJson.signature,
    // );

    // expect(signedBytes.validate()).toBeTruthy();
    // expect(signedBytes.publicKey.validateId(keyId)).toBeTruthy(); // no validateId on SignedBytes
  });
});
