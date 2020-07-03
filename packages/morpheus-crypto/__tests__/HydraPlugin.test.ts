import { Interfaces, Transactions, Utils, Managers } from '@arkecosystem/crypto';
import nodeConfig from './fixture/nodeConfig.json';

import {
  Coin,
  HydraPlugin,
  Seed,
  Vault,
  HydraParameters,
} from '../src';
import { installWindowCrypto } from './utils';

installWindowCrypto();
const unlockPassword = 'correct horse battery staple';

describe('Hydra transaction', () => {
  it('can be signed', () => {
    const vault = Vault.create(Seed.demoPhrase(), '', unlockPassword);
    const params = new HydraParameters(Coin.Hydra.Testnet, 0);
    HydraPlugin.rewind(vault, unlockPassword, params);
    const account = HydraPlugin.get(vault, params);

    const priv = account.priv(unlockPassword);
    const pk0 = priv.pub.key(0);
    const senderPublicKey = pk0.publicKey().toString();
    const address0 = pk0.address;

    // Manual construction
    const tx: unknown = {
      version: 2,
      network: 128,
      typeGroup: 1, // hyd_core
      type: 0, // transfer
      timestamp: 0,
      amount: Utils.BigNumber.make('10000000'),
      recipientId: 'tjseecxRmob5qBS2T3qc8frXDKz3YUGB8J',
      fee: Utils.BigNumber.make('100000'),
      senderPublicKey,
      nonce: Utils.BigNumber.make('1'),
    };
    const signedTx: Interfaces.ITransactionData = priv.signHydraTransaction(address0, tx);

    // Ark builder construction
    Managers.configManager.setConfig(nodeConfig);
    Managers.configManager.setHeight(7202);
    const builderTx: Interfaces.ITransactionData = Transactions.BuilderFactory.transfer()
      .amount('10000000')
      .fee('100000')
      .nonce('1')
      .recipientId('tjseecxRmob5qBS2T3qc8frXDKz3YUGB8J')
      .senderPublicKey(priv.pub.keyByAddress(address0).publicKey()
        .toString())
      .build().data;

    const builderSignedTx = priv.signHydraTransaction(address0, builderTx);

    const signature = '3045' +
      '022100978586a5c30739ce60d257f4626efd0997e72475bf242d05f4beb5be6d55624a' +
      '022055582d74bef29dc2daa83446c437911cdedfa1827f080553e6c7e151d0cab1c2';

    expect(signedTx.signature).toBe(signature);
    expect(builderSignedTx.signature).toBe(signature);
  });
});
