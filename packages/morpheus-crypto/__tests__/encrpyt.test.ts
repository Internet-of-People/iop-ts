import { encrypt, decrypt, encryptString, decryptString } from '../src';

describe('encrypt', () => {
  it('roundtrip text', () => {
    const password = 'correct horse battery staple';
    const message = 'Be at the big tree at 5pm tomorrow!';
    const cipherText = encryptString(message, password);

    expect(cipherText).toHaveLength(101);
    expect(cipherText[0]).toBe('u');

    const cipherText2 = encryptString(message, password);

    expect(cipherText2).toHaveLength(101);
    expect(cipherText2[0]).toBe('u');

    expect(cipherText).not.toBe(cipherText2);

    const decryptedText = decryptString(cipherText, password);
    const decryptedText2 = decryptString(cipherText2, password);

    expect(decryptedText).toBe(message);
    expect(decryptedText2).toBe(message);
  });

  it('roundtrip binary', () => {
    const password = 'correct horse battery staple';
    const messageHex = '00f1e2d3c4b5a69788796a5b4c3d2e1f';
    const plainData = Buffer.from(messageHex, 'hex');
    const cipherData = encrypt(plainData, password);

    expect(cipherData).toHaveLength(56);

    const decryptedData = decrypt(cipherData, password);

    expect(Buffer.from(decryptedData).toString('hex')).toBe(messageHex);
  });
});

