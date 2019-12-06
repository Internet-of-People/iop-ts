import Queue from 'p-queue';

import { IAppLog } from './app-log';

const queue = new Queue({concurrency: 1});

export type Task = () => Promise<void>;
export type Scheduler = (log: IAppLog, name: string, task: Task) => void;

export class NativeScheduler {
  public static timeout(name: string, ms:number): Promise<void> {
    return new Promise<void>(
      (res, rej) => {
        setTimeout(
          () => rej(new Error(`Task ${name} timeouted`)),
          ms
        );
      }
    );
  }

  /**
   * Schedules an async in FIFO.
   * Until the current running task is not completed, the next will not be started.
   * If any of the tasks is stuck for at least 5secs, it will fail and let the queue proceed.
   */
  public static schedule(log: IAppLog, name: string, task: Task): void {
    setImmediate(() => {
      log.debug(`Task ${name} started`);
      const taskWithTimeout = () => Promise.race([
        task(),
        NativeScheduler.timeout(name, 5000)
      ]);
      queue.add(taskWithTimeout)
        .then(() => { log.debug(`Task ${name} finished`); })
        .catch(e => { log.error(`Task ${name} failed: ${e} - ${JSON.stringify(e)}`); });
    });
  }
}
