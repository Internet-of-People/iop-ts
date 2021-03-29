export enum Network {
  LocalTestnet = 'local(testnet)',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Mainnet = 'mainnet',
}

export const getHostByNetwork = (network: Network): string => {
  switch (network) {
    case Network.LocalTestnet:
      return 'http://127.0.0.1';
    case Network.Testnet:
      return 'https://test.explorer.hydraledger.io';
    case Network.Devnet:
      return 'https://dev.explorer.hydraledger.io';
    case Network.Mainnet:
      return 'https://explorer.hydraledger.io';
    default:
      throw new Error(`Unknown network ${network}`);
  }
};

export class NetworkConfig {
  private constructor(
    public readonly host: string,
    public readonly port: number,
  ) {}

  public static fromUrl(host: string, port: number): NetworkConfig {
    return new NetworkConfig(host, port);
  }

  /**
   * @param network - the network type you'd like to use here. Either Network.[LocalTestnet|Testnet|Devnet|Mainnet]
   * @param port - the port you'd like to connect to. The Hydra Core's by default port is 4703, but IOP's nodes operate
   * under https, which is 4705.
   */
  public static fromNetwork(network: Network, port = 4705): NetworkConfig {
    return new NetworkConfig(getHostByNetwork(network), port);
  }
}

export const allNetworks = [ Network.LocalTestnet, Network.Testnet, Network.Devnet, Network.Mainnet ];
