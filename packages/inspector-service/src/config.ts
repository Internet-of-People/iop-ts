import { readdirSync, Dirent, readFileSync } from 'fs';
import path from 'path';

import { Types } from '@internet-of-people/sdk';

import { addScenario } from './storage';
import { SqliteStorage } from './storage-sqlite';

export const addScenarios = async(folder: string, storage: SqliteStorage): Promise<void> => {
  const fileEntries: Dirent[] = readdirSync(folder, { encoding: 'utf8', withFileTypes: true });

  for (const fileEntry of fileEntries.filter((f) => {
    return f.isFile();
  })) {
    console.log(`adding scenario ${fileEntry.name} to database`);
    const fileContent = readFileSync(path.join(folder, fileEntry.name), { encoding: 'utf8' });
    const scenarioObj: Types.Sdk.IScenario = JSON.parse(fileContent);

    // TODO Check against scenario JSON Schema
    try {
      const scenarioId = await addScenario(storage, scenarioObj);
      await storage.addScenario(scenarioId);
    } catch (e) {
      console.log(`Already existed: ${e}`);
    }
  }
};
