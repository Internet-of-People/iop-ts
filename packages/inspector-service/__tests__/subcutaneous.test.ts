import request from 'supertest';
import { unlinkSync } from 'fs';

import { SqliteStorage } from '../src/storage-sqlite';
import { Service } from '../src/service';
import { Server } from '../src/server';
import { addScenarios } from '../src/config';
import { IO, JsonUtils } from '@internet-of-people/sdk';

import presenation1 from './signedPresentation1.json';
import { ISigned, IPresentation } from '@internet-of-people/sdk/dist/interfaces/io';

describe('Service', () => {
  const dbFilename = 'db/test.sqlite';

  const createStorage = async(): Promise<SqliteStorage> => {
    return SqliteStorage.open(dbFilename);
  };

  const createServer = async(): Promise<Server> => {
    const storage = await createStorage();
    return new Server(new Service(storage));
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

  it('returns scenarios', async() => {
    const server = await createServer();
    await request(server.app)
      .get('/scenarios')
      .expect(200, {
        scenarios: [
          'cjuacWXCijLpQ9vQvrCumkoSO5XqcWVuJN7jI938kImbCc',
        ],
      });
  });

  it('has scenario blob', async() => {
    const server = await createServer();
    await request(server.app)
      .get('/blob/cjuacWXCijLpQ9vQvrCumkoSO5XqcWVuJN7jI938kImbCc')
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const scenario: IO.IScenario = res.body;
        expect(scenario.name).toBe('Swimming discount');
        expect(scenario.version).toBe(1);
        expect(scenario.description).toBe('Reduced prices based on your resident address');
      });
  });

  it('presenation can be sent', async() => {
    const server = await createServer();
    const contentId = JsonUtils.digest(presenation1 as ISigned<IPresentation>);
    await request(server.app)
      .post('/presentation')
      .send(presenation1)
      .expect((res: request.Response) => {
        expect(res.status).toBe(202);
        const { body } = res;
        expect(body.contentId).toBe(contentId);
      });
  });

  it('presenation can be retrieved', async() => {
    const server = await createServer();
    const contentId = JsonUtils.digest(presenation1 as ISigned<IPresentation>);
    await request(server.app)
      .get(`/blob/${contentId}`)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const signedPresentation: IO.ISigned<IO.IPresentation> = res.body;
        expect(JsonUtils.digest(signedPresentation)).toBe(contentId);
      });
  });
});
