import Queue from 'p-queue';

import { IAppLog } from '@internet-of-people/logger';

const queue = new Queue({ concurrency: 1 });

export type Task = () => Promise<void>;
export type Scheduler = (log: IAppLog, name: string, task: Task) => void;

export const timeout = async(name: string, ms: number): Promise<void> => {
  return new Promise<void>(
    (res, rej) => {
      setTimeout(
        () => {
          return rej(new Error(`Task ${name} timeouted`));
        },
        ms,
      );
    },
  );
};

/**
 * Schedules an async in FIFO.
 * Until the current running task is not completed, the next will not be started.
 * If any of the tasks is stuck for at least 5secs, it will fail and let the queue proceed.
 */
export const schedule = (log: IAppLog, name: string, task: Task): void => {
  setImmediate(() => {
    log.debug(`Task ${name} started`);

    const taskWithTimeout = async(): Promise<void> => {
      return Promise.race([
        task(),
        timeout(name, 5000),
      ]);
    };
    queue.add(taskWithTimeout)
      .then(() => {
        log.debug(`Task ${name} finished`);
      })
      .catch((e) => {
        log.error(`Task ${name} failed: ${e}`);
      });
  });
};
