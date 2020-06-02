import { Types } from '@internet-of-people/sdk';
import Optional from 'optional-js';
import { askForPassphrase } from './utils';

/* eslint @typescript-eslint/promise-function-async: 0 */
const delay = (millis: number): Promise<void> => {
  return new Promise((resolve) => {
    return setTimeout(resolve, millis);
  });
};

export const processMorpheusTx = async(
  attempts: Types.Layer1.IOperationData[],
  operation: string,
  layer1Api: Types.Layer1.IApi,
  layer2Api: Types.Layer2.IApi,
): Promise<void> => {
  const passphrase = await askForPassphrase('gas address');
  const id = await layer1Api.sendMorpheusTxWithPassphrase(attempts, passphrase);
  console.log(`${operation} txn was sent, id: ${id}`);
  let result: Optional<boolean>;

  do {
    await delay(1000);
    result = await layer2Api.getTxnStatus(id);
  } while (!result.isPresent());

  console.log(`Layer-2 processing of ${id} has ${result.get() ? 'succeeded' : 'failed'}.`);
};
