import { Types } from '@internet-of-people/sdk';

export interface IAction {
  readonly id: string;
  readonly ignoreNetwork?: boolean;
  run(layer1Api: Types.Layer1.IApi|undefined, layer2Api: Types.Layer2.IApi|undefined): Promise<void>;
}
