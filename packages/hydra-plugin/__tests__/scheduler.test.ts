/* eslint @typescript-eslint/unbound-method: 0 */
import { IAppLog } from '@internet-of-people/logger';
import { schedule } from '../src/scheduler';

class Fixture {
  public logMock = {
    appName: 'hot-wallet-tests',
    debug: jest.fn<void, [string]>(),
    info: jest.fn<void, [string]>(),
    warn: jest.fn<void, [string]>(),
    error: jest.fn<void, [string]>(),
  };
  public log = this.logMock as IAppLog;

  public constructor() {
    jest.useFakeTimers();
  }
}

describe('Scheduler', () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = new Fixture();
  });

  it('scheduled calls resolve in sequence', async() => {
    const resolves: number[] = [];

    const task1 = async(): Promise<void> => {
      return new Promise<void>((res, _) => {
        setTimeout(() => {
          resolves.push(1);
          res();
        }, 100);
      });
    };

    const task2 = async(): Promise<void> => {
      return new Promise<void>((res, _) => {
        resolves.push(2);
        res();
      });
    };

    schedule(fixture.log, 'name1', task1);
    schedule(fixture.log, 'name2', task2);

    jest.runAllImmediates();
    jest.runAllTimers();

    // jest is not able to advance NodeJS native Promise micro-task queue
    while (resolves.length < 2) {
      await Promise.resolve(); // :)
    }

    expect(resolves).toStrictEqual([ 1, 2 ]);
  });

  it('stuck scheduled call will timeout', async() => {
    const resolves: number[] = [];

    const task1 = async(): Promise<void> => {
      return new Promise<void>((res, _) => {
        setTimeout(() => {
          resolves.push(1);
          res();
        }, 6000);
      });
    };

    const task2 = async(): Promise<void> => {
      return new Promise<void>((res, _) => {
        resolves.push(2);
        res();
      });
    };

    schedule(fixture.log, 'name1', task1);
    schedule(fixture.log, 'name2', task2);

    jest.runAllImmediates();
    jest.advanceTimersByTime(5100);

    // jest is not able to advance NodeJS native Promise micro-task queue
    while (resolves.length < 1) {
      await Promise.resolve(); // :)
    }
    // Do not ask us, why these are needed. Also, do not ask us why there are 3 calls needed
    // in node 12, but 1 was enough in node 10. If the test fails, try adding some more :P
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(resolves).toStrictEqual([2]);
    expect(fixture.log.error).toBeCalledWith(expect.stringMatching('Task name1 timeouted'));
  });
});
