import deepClone from 'lodash.clonedeep';
import request from 'supertest';
import e from 'express';
import { unlinkSync } from 'fs';

import { Crypto, Types } from '@internet-of-people/sdk';

import { SqliteStorage } from '../src/storage-sqlite';
import { Service } from '../src/service';
import { Server } from '../src/server';
import { addProcesses } from '../src/config';
import { JwtAuth } from '../src/jwt-auth';
import { FixedUsers } from '../src/fixed-users';

import { installWindowCrypto } from './utils';
import req1 from './signedWitnessRequest1.json';
import req2 from './signedWitnessRequest2.json';
import stmt2 from './signedWitnessStatement1.json';

installWindowCrypto();

const persona = (idx: number): Crypto.MorpheusPrivateKey => {
  const unlockPw = 'correct horse battery staple';
  const vault = Crypto.Vault.create(Crypto.Seed.demoPhrase(), '', unlockPw);
  Crypto.MorpheusPlugin.rewind(vault, unlockPw);
  const m = Crypto.MorpheusPlugin.get(vault);
  return m.priv(unlockPw).personas.key(idx);
};

interface IAuthApp {
  post(url: string, data: object): request.Test;
}

const authApp = (app: e.Application, sk: Crypto.PrivateKey): IAuthApp => {
  return {
    /* eslint-disable-next-line @typescript-eslint/promise-function-async */
    post: (url: string, data: object): request.Test => {
      const contentId = Crypto.digestJson(data);
      const token = Crypto.JwtBuilder.withContentId(contentId).sign(sk);
      return request(app)
        .post(url)
        .auth(token, { type: 'bearer' })
        .send(data);
    },
  };
};

/* eslint-disable-next-line @typescript-eslint/promise-function-async */
const postAuth = (app: e.Application, url: string, data: object): request.Test => {
  return authApp(app, persona(0).privateKey())
    .post(url, data);
};

describe('Service', () => {
  const dbFilename = 'db/test.sqlite';
  let cap1: Types.Authority.CapabilityLink | null = null;
  let cap2: Types.Authority.CapabilityLink | null = null;

  const createStorage = async(): Promise<SqliteStorage> => {
    return SqliteStorage.open(dbFilename);
  };

  const createServer = async(): Promise<Server> => {
    const storage = await createStorage();
    const users = new FixedUsers(persona(0).neuter()
      .publicKey()
      .toString());
    const jwtAuth = new JwtAuth(users.checker);
    const service = new Service(storage);
    return new Server(service, jwtAuth);
  };

  beforeAll(async(): Promise<void> => {
    try {
      unlinkSync(dbFilename);
    } catch (error) {
      console.log(`File was just not there? ${error}`);
    }
    const storage = await createStorage();
    await storage.migrate('./migrations/');
    await addProcesses('./processes/', storage);
  });

  it('returns processes', async() => {
    const server = await createServer();
    await request(server.app)
      .get('/processes')
      .expect(200, {
        processes: [
          'cjuc1fS3_nrxuK0bRr3P3jZeFeT51naOCMXDPekX8rPqho',
          'cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg',
          'cjujqhFEN_T2BV-TcyGNTHNeUds3m8aAc-vIWUdZSyK9Sw',
        ],
      });
  });

  it('has process blob', async() => {
    const server = await createServer();
    await request(server.app)
      .get('/blob/cjuc1fS3_nrxuK0bRr3P3jZeFeT51naOCMXDPekX8rPqho')
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const process: Types.Sdk.IProcess = res.body;
        expect(process.name).toBe('Age-over based on digitalized ID');
        expect(process.version).toBe(1);
        expect(process.description).toBe('Using a digitalized ID card you can prove you are over an age');
        expect(process.claimSchema).toBe('cjuGRHW9R6NpWRiiXPSX8Rw3ngfcZJC-fPiZtLQEJoldoc');
        expect(process.evidenceSchema).toBe('cjuungTbY6AgNroAtqudSDM406oohLu75QwV3gl2zSpftU');
        expect(process.constraintsSchema).toBeNull();
      });
  });

  it('request can be sent', async() => {
    const server = await createServer();
    await postAuth(server.app, '/requests', req1)
      .expect((res: request.Response) => {
        expect(res.status).toBe(202);
        const { body } = res;
        expect(body.capabilityLink).toMatch(/^u[A-Za-z0-9\-_]+$/);
        cap1 = body.capabilityLink;
      });
  });

  it('request status can be queried', async() => {
    const server = await createServer();
    expect(cap1).not.toBeNull();
    await request(server.app)
      .get(`/requests/${cap1}/status`)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const { body }: { body: Types.Authority.IRequestStatus; } = res;
        expect(body.status).toBe('pending');
        expect(body.signedStatement).toBeNull();
        expect(body.rejectionReason).toBeNull();
      });
  });

  it('resending request returns same capabilityLink', async() => {
    const server = await createServer();
    expect(cap1).not.toBeNull();
    await postAuth(server.app, '/requests', req1)
      .expect((res: request.Response) => {
        expect(res.status).toBe(202);
        const { body } = res;
        expect(body.capabilityLink).toBe(cap1);
      });
  });

  it('rejecting request', async() => {
    const server = await createServer();
    expect(cap1).not.toBeNull();
    await postAuth(server.app, `/requests/${cap1}/reject`, { rejectionReason: 'Just because' })
      .expect(200);
  });

  it('rejected request status has reason', async() => {
    const server = await createServer();
    expect(cap1).not.toBeNull();
    await request(server.app)
      .get(`/requests/${cap1}/status`)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const { body }: { body: Types.Authority.IRequestStatus; } = res;
        expect(body.status).toBe('rejected');
        expect(body.signedStatement).toBeNull();
        expect(body.rejectionReason).toBe('Just because');
      });
  });

  it('tampering with the request after signing is rejected', async() => {
    const server = await createServer();
    const req1mod: Types.Sdk.ISigned<Types.Sdk.IWitnessRequest> = deepClone(req1);
    (req1mod.content as Types.Sdk.IWitnessRequest).nonce = Crypto.nonce264();
    await postAuth(server.app, '/requests', req1mod)
      .expect((res: request.Response) => {
        expect(res.status).toBe(400);
        expect(res.body).toContain('invalid signature');
      });
  });

  it('request is accepted again signed with a different nonce', async() => {
    const server = await createServer();
    expect(cap1).not.toBeNull();
    await postAuth(server.app, '/requests', req2)
      .expect((res: request.Response) => {
        expect(res.status).toBe(202);
        const { body } = res;
        expect(body.capabilityLink).toMatch(/^u[A-Za-z0-9\-_]+$/);
        expect(body.capabilityLink).not.toBe(cap1);
        cap2 = body.capabilityLink;
      });
  });

  it('approving request without authorization fails', async() => {
    const server = await createServer();
    expect(cap2).not.toBeNull();
    await request(server.app)
      .post(`/requests/${cap2}/approve`)
      .send(stmt2)
      .expect((res: request.Response) => {
        expect(res.status).toBe(403);
      });
  });

  it('approving request with unauthorized key fails', async() => {
    const server = await createServer();
    expect(cap2).not.toBeNull();
    await authApp(server.app, persona(1).privateKey())
      .post(`/requests/${cap2}/approve`, stmt2)
      .expect((res: request.Response) => {
        expect(res.status).toBe(403);
      });
  });

  it('approving request 2', async() => {
    const server = await createServer();
    expect(cap2).not.toBeNull();
    await postAuth(server.app, `/requests/${cap2}/approve`, stmt2)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
      });
  });

  it('rejecting approved request fails', async() => {
    const server = await createServer();
    expect(cap2).not.toBeNull();
    await postAuth(server.app, `/requests/${cap2}/reject`, { rejectionReason: 'Cause I can' })
      .expect(400);
  });
});
