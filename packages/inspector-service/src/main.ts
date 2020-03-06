import process from 'process';

import { Server } from './server';
import { Service } from './service';
import { SqliteStorage } from './storage-sqlite';
import { IStorage } from './storage';
import { addScenarios } from './config';

const createStorage = async(): Promise<IStorage> => {
  const dbFileName = process.env['INSPECTOR_DB'] || './db/inspector.sqlite';
  const migrationsFolder = process.env['INSPECTOR_MIGRATIONS'] || './migrations/';
  const scenariosFolder = process.env['INSPECTOR_PROCESSES'] || './scenarios/';

  const storage = await SqliteStorage.open(dbFileName);
  console.log('checking migrations');
  await storage.migrate(migrationsFolder);
  await addScenarios(scenariosFolder, storage);

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
  server.start(8081, '0.0.0.0');
};

mainAsync().catch((e) => {
  return console.log(`Fatal Error: ${e}`);
});
