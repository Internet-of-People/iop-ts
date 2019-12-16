export interface IAction {
  readonly id: string;
  readonly ignoreNetwork?: boolean;
  run(): Promise<void>;
}
