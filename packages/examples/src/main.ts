/* eslint no-undefined: 0 */
import { Layer1, Layer2 } from '@internet-of-people/sdk';
import { BeforeProof, Key, Right, Tombstone, Transfer, Vault } from './actions';
import { askForNetwork, chooseAction } from './utils';

const rootActions = [ BeforeProof, Key, Right, Tombstone, Transfer, Vault ];

const asyncRun = async(): Promise<void> => {
  const rootAction = await chooseAction(rootActions, process.argv[2]);

  if (rootAction && !rootAction.ignoreNetwork) {
    const network = await askForNetwork();
    const layer1Api = await Layer1.createApi(network);
    const layer2Api = Layer2.createApi(network);
    await rootAction.run(layer1Api, layer2Api);
  } else {
    await rootAction.run(undefined, undefined);
  }
};

asyncRun().catch((e) => {
  return console.log('error: ', e);
});
