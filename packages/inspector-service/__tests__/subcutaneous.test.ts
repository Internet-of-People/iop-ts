import request from 'supertest';
import { unlinkSync } from 'fs';
import { Interfaces as CryptoIf } from '@arkecosystem/crypto';

import { Interfaces as DidIf } from '@internet-of-people/did-manager';
import { IO, JsonUtils } from '@internet-of-people/sdk';
type ISigned<T> = IO.ISigned<T>;
type IPresentation = IO.IPresentation;
type Did = IO.Did;
type IAfterProof = IO.IAfterProof;

import { SqliteStorage } from '../src/storage-sqlite';
import { Service } from '../src/service';
import { Server } from '../src/server';
import { addScenarios } from '../src/config';
import { IHydraApi } from '../src/hydra-api';

import presenation1 from './signedPresentation1.json';

describe('Service', () => {
  const dbFilename = 'db/test.sqlite';

  const createStorage = async(): Promise<SqliteStorage> => {
    return SqliteStorage.open(dbFilename);
  };

  beforeAll(async(): Promise<void> => {
    try {
      unlinkSync(dbFilename);
    } catch (error) {
      console.log(`File was just not there? ${error}`);
    }
    const storage = await createStorage();
    await storage.migrate('./migrations/');
    await addScenarios('./scenarios/', storage);
  });

  /* eslint @typescript-eslint/no-use-before-define:0 */
  let fixture: Fixture;
  beforeEach(async(): Promise<void> => {
    fixture = await Fixture.create();
  });

  it('returns scenarios', async() => {
    await request(fixture.app)
      .get('/scenarios')
      .expect(200, {
        scenarios: [
          'cjuFURvWkcd-82J83erY_dEUhlRf9Yn8OiWWl7SxVpBvf4',
        ],
      });
  });

  it('has scenario blob', async() => {
    await request(fixture.app)
      .get('/blob/cjuFURvWkcd-82J83erY_dEUhlRf9Yn8OiWWl7SxVpBvf4')
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const scenario: IO.IScenario = res.body;
        expect(scenario.name).toBe('Swimming discount');
        expect(scenario.version).toBe(1);
        expect(scenario.description).toBe('Reduced prices based on your resident address');
      });
  });

  it('presenation can be sent', async() => {
    const contentId = JsonUtils.digest(presenation1 as ISigned<IPresentation>);
    await request(fixture.app)
      .post('/presentation')
      .send(presenation1)
      .expect((res: request.Response) => {
        expect(res.status).toBe(202);
        const { body } = res;
        expect(body.contentId).toBe(contentId);
      });
  });

  it('presenation can be retrieved', async() => {
    const contentId = JsonUtils.digest(presenation1 as ISigned<IPresentation>);
    await request(fixture.app)
      .get(`/blob/${contentId}`)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const signedPresentation: IO.ISigned<IO.IPresentation> = res.body;
        expect(JsonUtils.digest(signedPresentation)).toBe(contentId);
      });
  });

  it('returns after-proof', async() => {
    const afterProof: IAfterProof = { blockHeight: 200, blockHash: 'someUnreadableHex' };
    fixture.hydraMock.getBlockIdAtHeight.mockImplementationOnce(async() => {
      return afterProof;
    });
    await request(fixture.app)
      .get('/after-proof')
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(afterProof);
      });
  });

  class Fixture {
    public readonly hydraMock = {
      getNodeCryptoConfig: jest.fn<Promise<CryptoIf.INetworkConfig>, []>(),
      getBlockIdAtHeight: jest.fn<Promise<IAfterProof | null>, [number | undefined]>(),
      beforeProofExists: jest.fn<Promise<boolean>, [string]>(),
      getDidDocument: jest.fn<Promise<DidIf.IDidDocument>, [Did]>(),
    };
    private readonly server: Server;

    private constructor(storage: SqliteStorage) {
      const hydra: IHydraApi = this.hydraMock;
      this.server = new Server(new Service(storage, hydra));
    }

    public get app(): Express.Application {
      return this.server.app;
    }

    public static async create(): Promise<Fixture> {
      return new Fixture(await createStorage());
    }
  }
});
