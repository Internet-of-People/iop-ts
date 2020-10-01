import { Interfaces as CryptoIf } from '@arkecosystem/crypto';

export interface IInitializable {
  init(): Promise<void>;
}

export interface IBlockListener {
  onBlockApplied(block: CryptoIf.IBlockData): Promise<void>;
  onBlockReverted(block: CryptoIf.IBlockData): Promise<void>;
}

export interface IBlockEventSource extends IInitializable {
  subscribe(name: string, listener: IBlockListener): void;
  unsubscribe(name: string): void;
}
