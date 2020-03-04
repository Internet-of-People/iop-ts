import { readdirSync, Dirent, readFileSync } from 'fs';
import path from 'path';

import { IO } from '@internet-of-people/sdk';
import { addProcessSchemas } from './storage';
import { SqliteStorage } from './storage-sqlite';

export const addProcesses = async(folder: string, storage: SqliteStorage): Promise<void> => {
  const fileEntries: Dirent[] = readdirSync(folder, { encoding: 'utf8', withFileTypes: true });

  for (const fileEntry of fileEntries.filter((f) => {
    return f.isFile();
  })) {
    console.log(`adding process ${fileEntry.name} to database`);
    const fileContent = readFileSync(path.join(folder, fileEntry.name), { encoding: 'utf8' });
    const processObj: IO.IProcess = JSON.parse(fileContent);

    // TODO Check against process JSON Schema
    try {
      const processId = await addProcessSchemas(storage, processObj);
      await storage.addProcess(processId);
    } catch (e) {
      console.log(`Already existed: ${e}`);
    }
  }
};
