import { CoeusAsset } from '@internet-of-people/sdk-wasm';
import ByteBuffer from 'bytebuffer';

describe('Serialize/deserialize works', () => {
  const json = {
    bundles: [
      {
        operations: [
          {
            type: 'register',
            name: '.schema.eidcard',
            owner: 'psz2Bmoub8W72YEYshmbmLLExyN3tPxRun2Vk2SWEJJke6JM',
            subtreePolicies: {},
            registrationPolicy: 'owner',
            data: {},
            expiresAtHeight: 69,
          },
        ],
        nonce: 2,
        publicKey: 'psz2Bmoub8W72YEYshmbmLLExyN3tPxRun2Vk2SWEJJke6JM',
        signature: 'ssz7pKbfUW2NvcnqRFKJjTCx46GVFy7X48PyUhFWoQVUwiFWVvb7541ocgRs67kBaV6X2YHDJXSEqxzr1K7YeL14f2t',
      },
    ],
  };
  const asset = new CoeusAsset(json);

  it('explicit call to toJSON', () => {
    const serializedBytes: Uint8Array = asset.serialize();

    const buffer = ByteBuffer.wrap(serializedBytes);

    const deserializedBytes: Uint8Array = Uint8Array.from(buffer.buffer);
    const deserializedAsset = CoeusAsset.deserialize(deserializedBytes);

    expect(serializedBytes).toStrictEqual(deserializedBytes);
    expect(deserializedAsset.toJSON()).toStrictEqual(json);
  });

  it('implicit call to toJSON', () => {
    const jsonString = JSON.stringify(asset);
    const parsedJson = JSON.parse(jsonString);
    expect(parsedJson).toStrictEqual(json);
  });
});
