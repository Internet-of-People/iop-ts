import { Logger } from '@arkecosystem/core-interfaces';

export const LOGGER_COMPONENT_NAME = 'morpheus-logger';

export interface IAppLog {
  readonly appName: string;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export class AppLog implements IAppLog {
  private readonly PREFIX: string = 'MORPHEUS';
  private readonly logger: Logger.ILogger;

  public constructor(logger: Logger.ILogger) {
    this.logger = logger;
  }

  public get appName(): string {
    return this.PREFIX;
  }

  public debug(message: string): void {
    this.logger.debug(`${this.PREFIX} ${message}.`);
  }

  public info(message: string): void {
    this.logger.info(`${this.PREFIX} ${message}.`);
  }

  public warn(message: string): void {
    this.logger.warn(`${this.PREFIX} ${message}.`);
  }

  public error(message: string): void {
    this.logger.error(`${this.PREFIX} ${message}.`);
  }
}
