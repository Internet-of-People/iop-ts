import { Logger } from '@arkecosystem/core-interfaces';

export const COMPONENT_NAME:string = 'morpheus-logger';

export interface IAppLog {
  readonly appName: string;
  debug(message: any): void;
  info(message: any): void;
  warn(message: any): void;
  error(message: any): void;
}

export class AppLog implements IAppLog {
  private readonly PREFIX = 'morpheus-hydra-plugin';
  private readonly logger: Logger.ILogger;

  public constructor(logger: Logger.ILogger) {
    this.logger = logger;
  }

  public get appName(): string {
    return this.PREFIX;
  }

  public debug(message: any) {
    this.logger.debug(`${this.PREFIX} ${message}.`);
  }

  public info(message: any) {
    this.logger.info(`${this.PREFIX} ${message}.`);
  }

  public warn(message: any) {
    this.logger.warn(`${this.PREFIX} ${message}.`);
  }

  public error(message: any) {
    this.logger.error(`${this.PREFIX} ${message}.`);
  }
}
