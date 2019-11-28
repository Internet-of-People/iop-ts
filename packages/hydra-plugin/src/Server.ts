import { createServer, mountServer } from "@arkecosystem/core-http-utils";
// import { badData, boomify, notFound, unauthorized } from "@hapi/boom";
import { Lifecycle, Request } from "@hapi/hapi"
import { IAppLog } from "./AppLog";

import { IInitializable } from "./Main";

export class Server implements IInitializable {
  public constructor(
    private host: string, 
    private port: number, 
    private log: IAppLog,
  ) {}

  public async init(): Promise<void> {
    const server = await createServer({
      host: this.host,
      port: this.port
    });
    server.route([
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
          // TODO: update the architecture docs too.
          return false;
        }
      },
    ]);
    return mountServer("Wallet API", server);
  }
}
