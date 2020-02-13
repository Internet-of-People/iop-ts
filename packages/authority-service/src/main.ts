import process from 'process';

import { Server } from './server';
import { Service } from './service';
import { SqliteStorage } from './storage-sqlite';
import { IStorage } from './storage';
import { addProcesses } from './config';

const createStorage = async(): Promise<IStorage> => {
  const dbFileName = process.env['AUTHORITY_DB'] || './db/authority.sqlite';
  const migrationsFolder = process.env['AUTHORITY_MIGRATIONS'] || './migrations/';
  const processesFolder = process.env['AUTHORITY_PROCESSES'] || './processes/';

  const storage = await SqliteStorage.open(dbFileName);
  console.log('checking migrations');
  await storage.migrate(migrationsFolder);
  await addProcesses(processesFolder, storage);

  process.on('SIGINT', () => {
    console.log('Graceful shutdown started');
    /* eslint @typescript-eslint/no-floating-promises: 0 */
    storage.close()
      .catch((e) => {
        return console.error(`Error closing DB: ${e}`);
      })
      .finally(() => {
        return process.exit();
      });
  });

  return storage;
};

const mainAsync = async(): Promise<void> => {
  const storage = await createStorage();
  console.log('opened database');
  const server = new Server(new Service(storage));
  server.start(8080, '0.0.0.0');
};

mainAsync().catch((e) => {
  return console.log(`Fatal Error: ${e}`);
});
