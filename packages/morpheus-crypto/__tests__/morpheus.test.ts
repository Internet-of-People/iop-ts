import { Morpheus, Did, Bip39, Seed } from '../src';

describe('morpheus', () => {
  it('derivation', () => {
    const seed = new Bip39('en').phrase(Seed.demoPhrase())
      .password('');
    const root = Morpheus.root(seed);
    const personas = root.personas();
    const persona0 = personas.key(0);
    const persona0pub = persona0.neuter();
    const pk0 = persona0pub.publicKey();
    const id0 = pk0.keyId();
    const did0 = Did.fromKeyId(id0);

    expect(root.path).toBe(`m/128164'`);
    expect(persona0.path).toBe(`m/128164'/0'/0'`);
    expect(persona0.kind).toBe('Persona');
    expect(persona0.idx).toBe(0);
    expect(persona0.privateKey().publicKey()
      .toString()).toBe('pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6');
    expect(pk0.toString()).toBe('pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6');
    expect(id0.toString()).toBe('iezqztJ6XX6GDxdSgdiySiT3J');
    expect(did0.toString()).toBe('did:morpheus:ezqztJ6XX6GDxdSgdiySiT3J');
  });
});
