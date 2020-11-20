import { Interfaces } from '@arkecosystem/crypto';
import { Crypto, Layer1, Types, NetworkConfig, Network } from '../src';
import { ICoeusAsset } from '../../coeus-proto';
import { DomainName, HydraPrivate, Principal, PublicKey, SubtreePolicies, UserOperation } from '../../sdk-wasm';
import { installWindowCrypto } from './utils';
installWindowCrypto();

class Fixture {
  public axiosClientMock = {
    networkConfig: NetworkConfig.fromNetwork(Network.Testnet),
    sendTx: jest.fn<Promise<string>, [Interfaces.ITransactionJson]>(),
    getWalletNonce: jest.fn<Promise<BigInt>, [string]>(),
  };

  public axiosClient = this.axiosClientMock as unknown as Types.Layer1.IClient;

  public createSut(): Layer1.Api {
    return new Layer1.Api(this.axiosClient);
  }

  public createHydraPrivate(): HydraPrivate {
    const { phrase } = new Crypto.Bip39('en').generate();
    const unlockPassword = 'unlockPassword';
    const vault = Crypto.Vault.create(phrase, 'A', unlockPassword);
    const hydraParams = new Crypto.HydraParameters(
      Crypto.Coin.Hydra.Testnet,
      0,
    );

    Crypto.HydraPlugin.rewind(vault, unlockPassword, hydraParams);
    const hydra = Crypto.HydraPlugin.get(vault, hydraParams);

    return hydra.priv(unlockPassword);
  }

  public createRegisterOp(
    domain: string,
    pubKey: Crypto.SecpPublicKey,
    data: JSON,
    expiresAtHeight: number,
  ): UserOperation {
    const domainName = new DomainName(domain);
    const ownerPubKey = Crypto.PublicKey.fromSecp(pubKey);
    const principal = Principal.publicKey(ownerPubKey);
    const subtreePolicies = new SubtreePolicies();
    const subtreePolicy = subtreePolicies.withExpiration(expiresAtHeight);

    return UserOperation.register(domainName, principal, subtreePolicy, data, expiresAtHeight);
  }

  public createUpdateOp(domain: string, data: JSON): UserOperation {
    const domainName = new DomainName(domain);
    return UserOperation.update(domainName, data);
  }

  public createRenewOp(domain: string, expiresAtHeight: number): UserOperation {
    const domainName = new DomainName(domain);
    return UserOperation.renew(domainName, expiresAtHeight);
  }

  public createTransferOp(domain: string, toPubKey: Crypto.SecpPublicKey): UserOperation {
    const domainName = new DomainName(domain);
    const ownerPubKey = Crypto.PublicKey.fromSecp(toPubKey);
    const principal = Principal.publicKey(ownerPubKey);
    return UserOperation.transfer(domainName, principal);
  }

  public createDeleteOp(domain: string): UserOperation {
    const domainName = new DomainName(domain);
    return UserOperation.delete(domainName);
  }
}

describe('Coeus transaction', () => {
  let fixture: Fixture;
  let api: Layer1.Api;
  let hydraPrivate: HydraPrivate;

  const hydraNonce = BigInt(1);
  const registerData = JSON.parse('{ "Data": "https://iop.global" }');

  beforeEach(() => {
    fixture = new Fixture();
    api = fixture.createSut();
    hydraPrivate = fixture.createHydraPrivate();
  });

  it('Mock Initialized', async() => {
    expect(api).toBeInstanceOf(Layer1.Api);
  });

  it('sendCoeusTx called without a nonce calls getWalletNonce', async() => {
    fixture.axiosClientMock.getWalletNonce.mockReturnValue(Promise.resolve(hydraNonce));

    const toOwner = hydraPrivate.pub.key(1).publicKey();
    const userOperations = [
      fixture.createRegisterOp('.schema.test123', toOwner, registerData, 10568),
      fixture.createRenewOp('.schema.david', 59697),
    ];
    const fromAddress = hydraPrivate.pub.key(0).address;

    await api.sendCoeusTx(fromAddress, userOperations, hydraPrivate);

    expect(fixture.axiosClientMock.getWalletNonce).toHaveBeenCalledTimes(1);
    expect(fixture.axiosClientMock.getWalletNonce).toHaveReturnedWith(Promise.resolve(hydraNonce));
  });

  it('sendCoeusTx passes correct arguments to sendTx (without a nonce)', async() => {
    fixture.axiosClientMock.getWalletNonce.mockReturnValue(Promise.resolve(hydraNonce));

    const toOwner = hydraPrivate.pub.key(1).publicKey();
    const userOperations = [
      fixture.createRegisterOp('.schema.test123', toOwner, registerData, 589736),
      fixture.createRenewOp('.schema.iopdns', 47956),
    ];

    const { address } = hydraPrivate.pub.key(0);
    const fromPubKey = hydraPrivate.pub.key(0).publicKey();
    const coeusPubKey = PublicKey.fromSecp(fromPubKey);

    await api.sendCoeusTx(address, userOperations, hydraPrivate);

    expect(fixture.axiosClientMock.sendTx).toHaveBeenCalledTimes(1);

    const [[{ nonce, senderPublicKey, amount }]] = fixture.axiosClientMock.sendTx.mock.calls;
    expect(nonce).toBe((hydraNonce + BigInt(1)).toString());
    expect(senderPublicKey).toBe(fromPubKey.toString());
    expect(amount).toBe('0');

    const asset = fixture.axiosClientMock.sendTx.mock.calls[0][0].asset as unknown as ICoeusAsset;
    expect(asset.bundles.length).toBe(1);
    expect(asset.bundles[0].operations.length).toBe(userOperations.length);
    expect(asset.bundles[0].publicKey).toBe(coeusPubKey.toString());
  });

  it('sendCoeusTx called with nonce does not call getWalletNonce', async() => {
    const toOwner = hydraPrivate.pub.key(1).publicKey();
    const userOperations = [
      fixture.createRegisterOp('.schema.test123', toOwner, registerData, 45687),
      fixture.createRenewOp('.schema.iopdns', 45687),
    ];

    const { address } = hydraPrivate.pub.key(0);

    await api.sendCoeusTx(address, userOperations, hydraPrivate, hydraNonce);

    expect(fixture.axiosClientMock.getWalletNonce).toHaveBeenCalledTimes(0);
  });

  it('sendCoeusTx passes correct arguments to sendTx (with nonce)', async() => {
    const toOwner = hydraPrivate.pub.key(1).publicKey();
    const userOperations = [
      fixture.createRegisterOp('.schema.test123', toOwner, registerData, 456697),
      fixture.createRenewOp('.schema.iopdns', 4568746),
    ];

    const { address } = hydraPrivate.pub.key(0);
    const fromPubKey = hydraPrivate.pub.key(0).publicKey();
    const coeusPubKey = PublicKey.fromSecp(fromPubKey);

    await api.sendCoeusTx(address, userOperations, hydraPrivate, hydraNonce);

    expect(fixture.axiosClientMock.sendTx).toHaveBeenCalledTimes(1);

    const [[{ nonce, senderPublicKey, amount }]] = fixture.axiosClientMock.sendTx.mock.calls;
    expect(nonce).toBe(hydraNonce.toString());
    expect(senderPublicKey).toBe(fromPubKey.toString());
    expect(amount).toBe('0');

    const asset = fixture.axiosClientMock.sendTx.mock.calls[0][0].asset as unknown as ICoeusAsset;
    expect(asset.bundles.length).toBe(1);
    expect(asset.bundles[0].operations.length).toBe(userOperations.length);
    expect(asset.bundles[0].publicKey).toBe(coeusPubKey.toString());
  });
});
