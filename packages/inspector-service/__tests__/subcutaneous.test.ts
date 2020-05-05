import request from 'supertest';
import { unlinkSync } from 'fs';

import { Ark, Crypto, Layer2, Types } from '@internet-of-people/sdk';

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
        const scenario: Types.Sdk.IScenario = res.body;
        expect(scenario.name).toBe('Swimming discount');
        expect(scenario.version).toBe(1);
        expect(scenario.description).toBe('Reduced prices based on your resident address');
      });
  });

  it('presenation can be sent', async() => {
    const contentId = Crypto.digest(presenation1 as Types.Sdk.ISigned<Types.Sdk.IPresentation>);
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
    const contentId = Crypto.digest(presenation1 as Types.Sdk.ISigned<Types.Sdk.IPresentation>);
    await request(fixture.app)
      .get(`/blob/${contentId}`)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const signedPresentation: Types.Sdk.ISigned<Types.Sdk.IPresentation> = res.body;
        expect(Crypto.digest(signedPresentation)).toBe(contentId);
      });
  });

  it('returns after-proof', async() => {
    const afterProof: Types.Sdk.IAfterProof = { blockHeight: 200, blockHash: 'someUnreadableHex' };
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

  it('validation checks Hydra node', async() => {
    const afterProof: Types.Sdk.IAfterProof = {
      blockHeight: 180,
      blockHash: 'youAintKnowThisBeforeBlock180',
    };
    const validationRequest: Types.Verifier.IValidationRequest = {
      publicKey: 'pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6',
      contentId: 'cjuwtAZcIdlSzKS8i8qvg5Ux-N0-s5MOKkE1qyzsmlGw5A',
      signature: 'sezAhsRgfDMRvSTFmLjDDkbFcxjPMxBrbo8ikJ1j8sba2oxoe5cLGc8J5FsMx8czVVRVKurwTJUkCRktC177ZGJp5Md',
      onBehalfOf: 'did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr',
      afterProof,
    };
    const didDocData: Types.Layer2.IDidDocumentData = {
      did: validationRequest.onBehalfOf,
      queriedAtHeight: 200,
      tombstoned: false,
      tombstonedAtHeight: null,
      keys: [{
        index: 0,
        auth: new Crypto.PublicKey(validationRequest.publicKey).keyId()
          .toString(),
        valid: true,
        validFromHeight: null,
        validUntilHeight: null,
      }],
      rights: {
        'impersonate': [
          {
            keyLink: '#0',
            valid: true,
            history: [
              { height: null, valid: true },
            ],
          },
        ],
      },
    };
    fixture.hydraMock.getDidDocument.mockImplementationOnce(async(): Promise<Types.Layer2.IDidDocument> => {
      return new Layer2.DidDocument(didDocData);
    });
    fixture
      .hydraMock
      .getBeforeProofHistory
      .mockImplementationOnce(async(): Promise<Types.Layer2.IBeforeProofHistory> => {
        return {
          contentId: validationRequest.contentId,
          existsFromHeight: null,
          queriedAtHeight: 200,
        };
      });
    fixture.hydraMock.getBlockIdAtHeight.mockImplementationOnce(async(): Promise<Types.Sdk.IAfterProof> => {
      return afterProof;
    });
    await request(fixture.app)
      .post('/validate')
      .send(validationRequest)
      .expect((res: request.Response) => {
        expect(res.status).toBe(200);
        const validationResult: Types.Verifier.IValidationResult = res.body;
        expect(validationResult.errors).toHaveLength(0);
        expect(validationResult.warnings).toHaveLength(0);
      });
    expect(fixture.hydraMock.getBeforeProofHistory).toBeCalledTimes(1);
    expect(fixture.hydraMock.getBlockIdAtHeight).toBeCalledTimes(1);
    expect(fixture.hydraMock.getDidDocument).toBeCalledTimes(1);
  });

  class Fixture {
    public readonly hydraMock = {
      getNodeCryptoConfig: jest.fn<Promise<Ark.Interfaces.INetworkConfig>, []>(),
      getBlockIdAtHeight: jest.fn<Promise<Types.Sdk.IAfterProof | null>, [number | undefined]>(),
      getBeforeProofHistory: jest.fn<Promise<Types.Layer2.IBeforeProofHistory>, [Types.Sdk.ContentId]>(),
      beforeProofExists: jest.fn<Promise<boolean>, [string]>(),
      getDidDocument: jest.fn<Promise<Types.Layer2.IDidDocument>, [Crypto.Did]>(),
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
