import { Logger } from '@arkecosystem/core-interfaces';

export const HYDRA_LOGGER_COMPONENT_NAME = 'hydra-logger';
export const MORPHEUS_LOGGER_COMPONENT_NAME = 'morpheus-logger';
export const COEUS_LOGGER_COMPONENT_NAME = 'coeus-logger';

export interface IAppLog {
  readonly appName: string;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export class AppLog implements IAppLog {
  public constructor(private readonly logger: Logger.ILogger, private readonly prefix: string) {
  }

  public get appName(): string {
    return this.prefix;
  }

  public debug(message: string): void {
    this.logger.debug(`${this.prefix} ${message}.`);
  }

  public info(message: string): void {
    this.logger.info(`${this.prefix} ${message}.`);
  }

  public warn(message: string): void {
    this.logger.warn(`${this.prefix} ${message}.`);
  }

  public error(message: string): void {
    this.logger.error(`${this.prefix} ${message}.`);
  }
}
