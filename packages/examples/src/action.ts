export interface IAction {
  readonly id: string;
  run(): Promise<void>;
}
