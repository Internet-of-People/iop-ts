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
      return 'http://35.187.56.222';
    case Network.Devnet:
      return 'http://35.240.62.119';
    case Network.Mainnet:
      return 'http://35.195.150.223';
    default:
      throw new Error(`Unknown network ${network}`);
  }
};
