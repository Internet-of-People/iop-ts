import { Lifecycle, Request, Server as HapiServer } from '@hapi/hapi';
import { notFound } from '@hapi/boom';
import { StateHandler } from './state-handler';
import { IAppLog } from '@internet-of-people/hydra-plugin-core';
import { DomainName, PublicKey } from '@internet-of-people/sdk-wasm';


export class CoeusAPI {
  public constructor(
    private readonly log: IAppLog,
    private readonly stateHandler: StateHandler,
  ) {
  }

  public async init(hapi: HapiServer): Promise<void> {
    await hapi.register({
      register: (server) => {
        return this.registerPlugin(server);
      },
      name: 'coeus',
      version: '1.0.0',
      dependencies: 'api',
    }, {
      routes: { prefix: '/coeus/v1' },
    });
  }

  private registerPlugin(server: HapiServer): void {
    server.route([
      {
        method: 'GET',
        path: '/resolve/{name}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { name } } = request;
          const domainName = new DomainName(name);
          this.log.debug(`Resolving ${domainName}`);

          try {
            const data: unknown = this.stateHandler.state.resolveData(domainName);
            return { data };
          } catch {
            throw notFound(`Cannot resolve ${domainName}`);
          }
        },
      },
      {
        method: 'GET',
        path: '/metadata/{name}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { name } } = request;
          const domainName = new DomainName(name);
          this.log.debug(`Getting metadata of ${domainName}`);

          try {
            const metadata: unknown = this.stateHandler.state.getMetadata(domainName);
            return metadata;
          } catch {
            throw notFound(`Cannot resolve ${domainName}`);
          }
        },
      },
      {
        method: 'GET',
        path: '/children/{name}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { name } } = request;
          const domainName = new DomainName(name);
          this.log.debug(`Getting child domains of ${domainName}`);

          try {
            const children: string[] = this.stateHandler.state.getChildren(domainName);
            return { children };
          } catch {
            throw notFound(`Cannot resolve ${domainName}`);
          }
        },
      },
      {
        method: 'GET',
        path: '/last-nonce/{pk}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { pk } } = request;
          const key = new PublicKey(pk);
          this.log.debug(`Getting nonce of ${key}`);
          const nonce: BigInt = this.stateHandler.state.lastNonce(key);
          return { nonce };
        },
      },
    ]);
  }
}
