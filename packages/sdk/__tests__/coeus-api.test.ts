import * as Crypto from '@internet-of-people/morpheus-crypto';
// import * as Coeus from '../src/coeus-wasm';
import { Layer1, Layer2, Network, NetworkConfig, Types } from '../src/';
import { installWindowCrypto } from './utils';
import { DomainName, Principal, SubtreePolicies, UserOperation } from '../../sdk-wasm';

installWindowCrypto();
class Fixture {
  public layer1Api!: Types.Layer1.IApi;

  public constructor(private readonly domainName: DomainName, private readonly networkConfig: NetworkConfig) {}

  public async initializeApi(): Promise<void> {
    this.layer1Api = await Layer1.createApi(this.networkConfig);
  }

  public initializeSender(): Crypto.HydraPrivate {
    const unlockPw = 'correct horse battery staple';
    const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPw);

    const parameters = new Crypto.HydraParameters(
      Crypto.Coin.Hydra.Testnet,
      0,
    );

    Crypto.HydraPlugin.init(vault, unlockPw, parameters);
    const hydra = Crypto.HydraPlugin.get(vault, parameters);
    return hydra.priv(unlockPw);
  }

  public async createSut(expiry: number): Promise<void> {
    const sender = this.initializeSender();
    const senderAddr = sender.pub.key(0).address;
    const senderPubKey = sender.pub.key(0).publicKey();

    const data = JSON.parse('{}');
    const createOp = this.createRegisterOp(
      senderPubKey,
      data,
      expiry);

    await this.layer1Api.sendCoeusTx(
      senderAddr,
      createOp,
      sender,
    );
  }

  public async deleteSut(): Promise<void> {
    const sender = this.initializeSender();
    const senderAddr = sender.pub.key(0).address;
    const deleteOp = this.createDeleteOp();

    await this.layer1Api.sendCoeusTx(
      senderAddr,
      deleteOp,
      sender,
    );
  }

  private createRegisterOp(
    pubKey: Crypto.SecpPublicKey,
    data: JSON,
    expiresAtHeight: number,
  ): UserOperation[] {
    const ownerPubKey = Crypto.PublicKey.fromSecp(pubKey);
    const principal = Principal.publicKey(ownerPubKey);
    const subtreePolicy = new SubtreePolicies();

    return [UserOperation.register(this.domainName, principal, subtreePolicy, data, expiresAtHeight)];
  }

  private createDeleteOp(): UserOperation[] {
    return [UserOperation.delete(this.domainName)];
  }
}

const networkConfig = NetworkConfig.fromNetwork(Network.Testnet);
const domainObject = new DomainName('.schema.testcoeusapi');
const fixture = new Fixture(domainObject, networkConfig);

let expiration: number;


async function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 12000);
  });
}

beforeAll(async() => {
  await fixture.initializeApi();
  const blockHeight = await fixture.layer1Api.getCurrentHeight();
  expiration = blockHeight + 100000 ;

  await fixture.createSut(expiration);
  await delay();
}, 30000);


afterAll(async(): Promise<void> => {
  await fixture.deleteSut();
  await delay();
}, 30000);

describe('Test Coeus API', () => {
  const coeusApi = Layer2.createCoeusApi(networkConfig);

  it('Get Tx status of confirmed Tx', async() => {
    const status = await coeusApi.getTxnStatus('932de7456996f4cd355d7d1076bf8bf9c7b26eb7f5c9829131b024b3c542b39b');
    expect(status.orElseGet(() => {
      return false;
    })).toBe(true);
  });

  it('Get Tx status of rejected Tx', async() => {
    const status = await coeusApi.getTxnStatus('6572ef3909f72be76728ff7d8e71ab66b65dc9ff2db57f22d05e9f2abd288989');
    expect(status.orElseGet(() => {
      return true;
    })).toBe(false);
  });


  it('PublicKey types are the same', async() => {
    const unlockPw = 'correct horse battery staple';
    const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPw);
    Crypto.MorpheusPlugin.init(vault, unlockPw);
    const m = Crypto.MorpheusPlugin.get(vault);
    const persona0 = m.priv(unlockPw).personas.key(0);
    const morpheusPk = persona0.neuter().publicKey();

    const nonce = await coeusApi.getLastNonce(morpheusPk);

    expect(nonce).toBe(BigInt(0));
  });

  it('Resolve schema', async() => {
    const resolvedData = await coeusApi.resolve(domainObject);
    expect({}).toStrictEqual(resolvedData);
  });

  it('Get metadata', async() => {
    const metadata = await coeusApi.getMetadata(domainObject);
    expect(metadata.owner).toBe('pszrCnjALVHwGhp18Xv3X5CuBoXAEYMdmnsCqXS58Zdh2GW');
    expect(metadata.subtreePolicies).toStrictEqual({});
    expect(metadata.registrationPolicy).toBe('owner');
    expect(metadata.expiresAtHeight).toBe(expiration);
  });

  it('Get Children', async() => {
    const children = await coeusApi.getChildren(domainObject);
    expect(children).toStrictEqual([]);
  });
});
