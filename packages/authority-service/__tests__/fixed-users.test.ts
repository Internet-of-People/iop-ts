import { FixedUsers } from '../src/fixed-users';

const pk0 = 'pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6';
const pk1 = 'pezDj6ea4tVfNRUTMyssVDepAAzPW67Fe3yHtuHL6ZNtcfJ';
const pk2 = 'pezsfLDb1fngso3J7TXU6jP3nSr2iubcJZ4KXanxrhs9gr';

describe('FixedUsers', () => {
  it('accepts empty pubKeys', () => {
    expect(() => {
      return new FixedUsers('');
    }).not.toThrow();
  });

  it('ignores pubKey format', () => {
    const users = new FixedUsers('\t some weird format   \r\n');

    expect(users.checker('some weird format')).toBeTruthy();
  });

  it('parses single pubKey', () => {
    const users = new FixedUsers(pk0);

    expect(users.checker(pk0)).toBeTruthy();
    expect(users.checker(pk1)).toBeFalsy();
    expect(users.checker(pk2)).toBeFalsy();
  });

  it('parses trimmed pubKeys separated by commas', () => {
    const users = new FixedUsers(`\t ${pk0} , ${pk1} \r\n`);

    expect(users.checker(pk0)).toBeTruthy();
    expect(users.checker(pk1)).toBeTruthy();
    expect(users.checker(pk2)).toBeFalsy();
  });
});
