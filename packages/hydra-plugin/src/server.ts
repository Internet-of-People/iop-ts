import { createServer } from "@arkecosystem/core-http-utils";
import { Lifecycle, Request, Server as HapiServer } from "@hapi/hapi";
import Optional from "optional-js";
import { IAppLog } from "./app-log";

// TODO break circular dependency
import { IInitializable } from "./main";
import { MorpheusStateHandler } from "./state-handler";

export const safePathInt = (pathHeightString: string|undefined|null): number|undefined => {
  return Number.isNaN( Number(pathHeightString)) || pathHeightString === null 
    ? undefined 
    : Number.parseInt(pathHeightString!);
};

export class Server implements IInitializable {
  private server: HapiServer|undefined;

  public constructor(
    private host: string,
    private port: number,
    private log: IAppLog,
    private stateHandler: MorpheusStateHandler,
  ) {}

  public async init(): Promise<void> {
    this.server = await createServer({
      host: this.host,
      port: this.port
    });
    this.server.route([
      {
        method: "GET",
        path: "/did/{did}/document/{blockHeight?}",
        handler: async (request: Request): Promise<Lifecycle.ReturnValue> => {
          const { params: {did} } = request;
          this.log.debug(`Getting DID document for ${did}`);
          return {};
        }
      },
      {
        method: "GET",
        path: "/did/{did}/operations/{from}/{to?}",
        handler: async (request: Request): Promise<Lifecycle.ReturnValue> => {
          const { params: {did, from, to} } = request;
          this.log.debug(`Getting DID operations for ${did} from ${from} to ${to}`);
          return [];
        }
      },
      {
        method: "GET",
        path: "/did/{did}/operation-attempts/{from}/{to?}",
        handler: async (request: Request): Promise<Lifecycle.ReturnValue> => {
          const { params: {did, from, to} } = request;
          this.log.debug(`Getting DID operation attempts for ${did} from ${from} to ${to}`);
          return [];
        }
      },
      {
        method: "GET",
        path: "/did/{did}/check-transaction-validity",
        handler: async (request: Request): Promise<Lifecycle.ReturnValue> => {
          const { params: {did} } = request;
          this.log.debug(`Checking tx validity for did ${did}`);
          return false;
        }
      },
      {
        method: "GET",
        path: "/before-proof/{contentId}/exists/{blockHeight?}",
        handler: async (request: Request): Promise<Lifecycle.ReturnValue> => {
          const { params: {contentId, blockHeight} } = request;
          return this.stateHandler.query.beforeProofExistsAt(
            contentId, 
            safePathInt(blockHeight),
          );
        }
      },
    ]);

    // mountServer depends on logger inside ark's container
    await this.server.start();
  }

  public get hapiServer(): Optional<HapiServer> {
    return Optional.ofNullable(this.server);
  }
}
