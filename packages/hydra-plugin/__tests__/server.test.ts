import { Server as HapiServer } from '@hapi/hapi';
import { MorpheusTransaction } from '@internet-of-people/did-manager';
import { EventEmitter } from 'events';
import { IAppLog } from '../src/app-log';
import { safePathInt, Server } from '../src/server';
import { MorpheusStateHandler } from '../src/state-handler';

const { Operations: { OperationAttemptsBuilder } } = MorpheusTransaction;

let hapiServer: HapiServer;
let fixture: Fixture;
describe('Server', () => {
  beforeEach(async () => {
    fixture = new Fixture();
    const server = new Server('0.0.0.0', 4705, fixture.log, fixture.stateHandler);
    await server.init();
    hapiServer = server.hapiServer.orElseThrow(()=>new Error('Could not init HAPI server'));
  });

  afterEach(async () => {
    if(hapiServer) {
      await hapiServer.stop();
    }
  });

  it('unregistered content does not exist', async () => {
    const res = await hapiServer.inject({
      method: 'get',
      url: '/before-proof/invalid_content_id/exists'
    });
    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe(JSON.stringify(false));
  });

  it('registered content exists only from its height', async () => {
    const contentId = 'myFavoriteContentId';
    const transactionId = 'myFavoriteTxid';
    const blockId = 'myFavoriteBlockId';
    const blockHeight = 5;
    const registrationAttempt = new OperationAttemptsBuilder()
      .registerBeforeProof(contentId)
      .getAttempts();
    fixture.stateHandler.applyTransactionToState({
      asset: { operationAttempts: registrationAttempt },
      blockHeight,
      blockId,
      transactionId,
    });

    const res5 = await hapiServer.inject({
      method: 'get',
      url: `/before-proof/${contentId}/exists/${blockHeight}`
    });
    expect(res5.statusCode).toBe(200);
    expect(res5.payload).toBe(JSON.stringify(true));

    const resLatest = await hapiServer.inject({
      method: 'get',
      url: `/before-proof/${contentId}/exists`
    });
    expect(resLatest.statusCode).toBe(200);
    expect(resLatest.payload).toBe(JSON.stringify(true));

    const res4 = await hapiServer.inject({
      method: 'get',
      url: `/before-proof/${contentId}/exists/${blockHeight-1}`
    });
    expect(res4.statusCode).toBe(200);
    expect(res4.payload).toBe(JSON.stringify(false));
  });
});

describe('safePathInt', () => {
  it('handles undefined', () => {
    expect(safePathInt(undefined)).toBe(undefined);
  });

  it('handles int as string', () => {
    expect(safePathInt('5')).toBe(5);
  });

  it('handles float as string', () => {
    expect(safePathInt('4.2')).toBe(4);
  });

  it('handles number with string concatenated', () => {
    expect(safePathInt('99balloons')).toBe(undefined);
    expect(safePathInt('balloons99')).toBe(undefined);
  });

  it('handles string', () => {
    expect(safePathInt('nowayitsanumber')).toBe(undefined);
  });

  it('handles null', () => {
    expect(safePathInt(null)).toBe(undefined); // tslint:disable-line no-null-keyword
  });

  it('handles string undefined', () => {
    expect(safePathInt('undefined')).toBe(undefined);
  });

  it('handles string null', () => {
    expect(safePathInt('null')).toBe(undefined);
  });

  it('handles empty array', () => {
    expect(safePathInt('[]')).toBe(undefined);
  });

  it('handles object', () => {
    expect(safePathInt('{}')).toBe(undefined);
  });
});

class Fixture {
  public emitter: NodeJS.EventEmitter = new EventEmitter();

  public logMock = {
    appName: 'hot-wallet-tests',
    debug: jest.fn<void, [any]>(),
    info: jest.fn<void, [any]>(),
    warn: jest.fn<void, [any]>(),
    error: jest.fn<void, [any]>(),
  };
  public log = this.logMock as IAppLog;

  public stateHandler = new MorpheusStateHandler(this.log, this.emitter);

}
