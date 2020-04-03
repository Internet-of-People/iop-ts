import { KeyId, PublicKey, Types } from '../src';

const display = (auth: Types.Authentication): string => {
  return auth.toString();
};

describe('Authentication', () => {
  it('can be displayed', () => {
    const id = new KeyId('iezbeWGSY2dqcUBqT8K7R14xr');
    const pk = new PublicKey('pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6');

    expect(display(id)).toBe('iezbeWGSY2dqcUBqT8K7R14xr');
    expect(display(pk)).toBe('pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6');
  });
});
