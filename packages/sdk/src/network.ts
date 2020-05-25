export enum Network {
  LocalTestnet = 'local(testnet)',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Mainnet = 'mainnet',
}

export const allNetworks = [ Network.LocalTestnet, Network.Testnet, Network.Devnet, Network.Mainnet ];

export const schemaAndHost = (network: Network): string => {
  switch (network) {
    case Network.LocalTestnet:
      return 'http://127.0.0.1';
    case Network.Testnet:
      return 'https://test.hydra.iop.global';
    case Network.Devnet:
      return 'https://dev.hydra.iop.global';
    case Network.Mainnet:
      return 'https://hydra.iop.global';
    default:
      throw new Error(`Unknown network ${network}`);
  }
};
