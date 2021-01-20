import { Interfaces } from '@arkecosystem/crypto';
import { Crypto, Layer1, Types, Network, NetworkConfig } from '../src';
import { HydraPrivate } from '../../sdk-wasm';
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

    Crypto.HydraPlugin.init(vault, unlockPassword, hydraParams);
    const hydra = Crypto.HydraPlugin.get(vault, hydraParams);

    return hydra.priv(unlockPassword);
  }

  public getFirstAddress(hydraPrivate: HydraPrivate): string {
    return hydraPrivate.pub.key(0).address;
  }

  public getPublicKey(address: string, hydraPrivate: HydraPrivate): string {
    return hydraPrivate.pub.keyByAddress(address).publicKey()
      .toString();
  }
}

describe('Hydra transaction', () => {
  let fixture: Fixture;
  let api: Layer1.Api;
  let hydraPrivate: HydraPrivate;
  let fromAddress: string;

  const toAddress = 'tdxCqhHLpyYr4fHEZ7BCaZ3c2mihbjasiu';
  const amount = BigInt(2);
  const nonce = BigInt(1);

  beforeEach(() => {
    fixture = new Fixture();
    api = fixture.createSut();
    hydraPrivate = fixture.createHydraPrivate();
    fromAddress = fixture.getFirstAddress(hydraPrivate);
  });

  it('Mock Initialized', async() => {
    expect(api).toBeInstanceOf(Layer1.Api);
  });

  it('sendTransferTx passes correct arguments without a nonce supplied', async() => {
    fixture.axiosClientMock.getWalletNonce.mockReturnValueOnce(Promise.resolve(nonce));

    await api.sendTransferTx(fromAddress, toAddress, amount, hydraPrivate);

    expect(fixture.axiosClientMock.sendTx).toHaveBeenCalledTimes(1);
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].nonce).toBe((nonce + BigInt(1)).toString());
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].amount).toBe(amount.toString());
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].recipientId).toBe(toAddress);
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].senderPublicKey)
      .toBe(fixture.getPublicKey(fromAddress, hydraPrivate));
  });

  it('sendTransferTx called without a nonce calls getWalletNonce', async() => {
    fixture.axiosClientMock.getWalletNonce.mockReturnValueOnce(Promise.resolve(nonce));

    await api.sendTransferTx(fromAddress, toAddress, amount, hydraPrivate);

    expect(fixture.axiosClientMock.getWalletNonce).toHaveBeenCalledTimes(1);
    expect(fixture.axiosClientMock.getWalletNonce).toHaveBeenCalledWith(fromAddress);
  });

  it('sendTransferTx passes correct arguments with nonce supplied', async() => {
    await api.sendTransferTx(fromAddress, toAddress, amount, hydraPrivate, nonce);

    expect(fixture.axiosClientMock.sendTx).toHaveBeenCalledTimes(1);
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].nonce).toBe(nonce.toString());
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].amount).toBe(amount.toString());
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].recipientId).toBe(toAddress);
    expect(fixture.axiosClientMock.sendTx.mock.calls[0][0].senderPublicKey)
      .toBe(fixture.getPublicKey(fromAddress, hydraPrivate));
  });


  it('sendTransferTx called with nonce does not call getWalletNonce', async() => {
    await api.sendTransferTx(fromAddress, toAddress, amount, hydraPrivate, nonce);

    expect(fixture.axiosClientMock.getWalletNonce).toHaveBeenCalledTimes(0);
    expect(fixture.axiosClientMock.sendTx).toHaveBeenCalledTimes(1);
  });
});
