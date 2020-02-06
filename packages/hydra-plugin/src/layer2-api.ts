import { Lifecycle, Request, Server as HapiServer } from '@hapi/hapi';
import { notFound } from '@hapi/boom';
import { IAppLog } from '@internet-of-people/logger';
import { Interfaces } from '@internet-of-people/did-manager';

export const safePathInt = (pathHeightString: string|undefined|null): number|undefined => {
  return Number.isNaN(Number(pathHeightString)) || pathHeightString === null ?
    /* eslint no-undefined: 0 */
    undefined :
    /* eslint @typescript-eslint/no-non-null-assertion: 0 */
    Number.parseInt(pathHeightString!);
};

export class Layer2API {
  public constructor(
    private readonly log: IAppLog,
    private readonly stateHandler: Interfaces.IMorpheusStateHandler,
    private readonly hapi: HapiServer,
  ) {}

  public init(): void {
    this.hapi.route([
      {
        method: 'GET',
        path: '/did/{did}/document/{blockHeight?}',
        handler: (request: Request): Lifecycle.ReturnValue => {
          const { params: { did, blockHeight } } = request;
          // Note: StateStore is notified about new blocks so it's impossible to get an undefined back
          const lastSeenBlockHeight: number = this.stateHandler.query.lastSeenBlockHeight();
          const queryAtHeight = safePathInt(blockHeight) || lastSeenBlockHeight;
          this.log.debug(
            `Getting DID document for ${did} at height ${queryAtHeight}, blockchain height is ${lastSeenBlockHeight}`,
          );
          const document = this.stateHandler.query.getDidDocumentAt(did, queryAtHeight);
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
  }
}
