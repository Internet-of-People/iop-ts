import express from 'express';

import { Crypto } from '@internet-of-people/sdk';

export type Middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

export type PubkeyChecker = (pubKey: string) => boolean;

export const pkParam = 'jwtPubkey';

export interface IAuth {
  auth: Middleware;
  pubKey(req: express.Request): string;
}

export class JwtAuth implements IAuth {
  // Map<PublicKey => tuple(NotBeforeTime, ExpiryTime)>
  // TODO We should fill up expiry time and periodically clean up expired items with leeway enabled.
  private readonly nonces: Map<string, [BigInt, BigInt]>;

  public constructor(private readonly checker: PubkeyChecker) {
    this.nonces = new Map();
  }

  public get auth(): Middleware {
    return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      const auth = req.header('Authorization');

      try {
        if (!auth) {
          throw new Error('No authorization header found');
        }

        const [ authType, token ] = auth.split(' ', 2);

        if (authType !== 'Bearer') {
          throw new Error(`Invalid authorization type ${authType}`);
        }
        const parsed = new Crypto.JwtParser(token);
        const pubKey = parsed.publicKey.toString();

        if (!this.checker(pubKey)) {
          throw new Error(`Public key ${pubKey} is not authorized`);
        }

        const nonce = this.nonces.get(pubKey);

        if (nonce) {
          const [createdAt] = nonce;

          if (createdAt >= parsed.createdAt) {
            throw new Error(`Cannot use tokens not created after ${createdAt}`);
          }
        }

        this.nonces.set(pubKey, [ parsed.createdAt, parsed.timeToLive ]);
        req.params[pkParam] = pubKey;
        next();
      } catch (error) {
        console.log(error);
        res.status(403).send(error.toString());
      }
    };
  }

  public pubKey(req: express.Request): string {
    return req.params[pkParam];
  }
}
