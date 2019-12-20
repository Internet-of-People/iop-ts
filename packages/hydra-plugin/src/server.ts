import { createServer } from '@arkecosystem/core-http-utils';
import { Lifecycle, Request, Server as HapiServer } from '@hapi/hapi';
import { notFound } from '@hapi/boom';
import Optional from 'optional-js';
import { IAppLog } from '@internet-of-people/logger';

// TODO break circular dependency
import { IInitializable } from './main';
import { Interfaces } from '@internet-of-people/did-manager';

export const safePathInt = (pathHeightString: string|undefined|null): number|undefined => {
  return Number.isNaN(Number(pathHeightString)) || pathHeightString === null ?
    /* eslint no-undefined: 0 */
    undefined :
    /* eslint @typescript-eslint/no-non-null-assertion: 0 */
    Number.parseInt(pathHeightString!);
};

export class Server implements IInitializable {
  private server: HapiServer|undefined;

  public constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly log: IAppLog,
    private readonly stateHandler: Interfaces.IMorpheusStateHandler,
  ) {}

  public async init(): Promise<void> {
    this.server = await createServer({
      host: this.host,
      port: this.port,
    });
    this.server.route([
      {
        method: 'GET',
        path: '/did/{did}/document/{blockHeight?}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { did, blockHeight } } = request;
          this.log.debug(`Getting DID document for ${did}`);
          const height = safePathInt(blockHeight) || this.stateHandler.lastSeenBlockHeight;
          const document = this.stateHandler.query.getDidDocumentAt(did, height);
          return document.toData();
        },
      },
      {
        method: 'GET',
        path: '/did/{did}/operations/{from}/{to?}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { did, from, to } } = request;
          this.log.debug(`Getting DID operations for ${did} from ${from} to ${to}`);
          return [];
        },
      },
      {
        method: 'GET',
        path: '/did/{did}/operation-attempts/{from}/{to?}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { did, from, to } } = request;
          this.log.debug(`Getting DID operation attempts for ${did} from ${from} to ${to}`);
          return [];
        },
      },
      {
        method: 'POST',
        path: '/check-transaction-validity',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const operationAttempts = (request.payload as unknown) as Interfaces.IOperationData[];
          this.log.debug('Checking tx validity');
          return this.stateHandler.dryRun(operationAttempts);
        },
      },
      {
        method: 'GET',
        path: '/before-proof/{contentId}/exists/{blockHeight?}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { contentId, blockHeight } } = request;
          this.log.debug(`Checking if before-proof ${contentId} exists at ${blockHeight}`);
          return this.stateHandler.query.beforeProofExistsAt(
            contentId,
            safePathInt(blockHeight),
          );
        },
      },
      {
        method: 'GET',
        path: '/txn-status/{txid}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { txid } } = request;
          this.log.debug(`Checking tx status for ${txid}`);
          const status: boolean = this.stateHandler.query.isConfirmed(txid)
            .orElseThrow(() => {
              return notFound(`Transaction ${txid} is not processed by morpheus (yet)`);
            });
          return status;
        },
      },
    ]);

    // mountServer depends on logger inside ark's container
    await this.server.start();
  }

  public get hapiServer(): Optional<HapiServer> {
    return Optional.ofNullable(this.server);
  }
}
