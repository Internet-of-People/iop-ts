// https://github.com/kriasoft/node-sqlite#es7-asyncawait
// https://node-sql-template-strings.surge.sh/

import sqlite from 'sqlite';
import { SQL } from 'sql-template-strings';

import { IO } from '@internet-of-people/sdk';

import { IStorage } from './storage';

export class SqliteStorage implements IStorage {
  private constructor(private readonly db: sqlite.Database) {}

  public static async open(filename: string): Promise<SqliteStorage> {
    const db = await sqlite.open(filename, { promise: Promise });
    return new SqliteStorage(db);
  }

  public async close(): Promise<void> {
    await this.db.close();
  }

  public async migrate(migrationsPath: string): Promise<void> {
    await this.db.migrate({ migrationsPath });
  }

  public async addScenario(contentId: IO.ContentId): Promise<boolean> {
    const query = SQL`INSERT INTO Scenario (contentId) VALUES (${contentId});`;
    const result: sqlite.Statement = await this.db.run(query);
    return result.changes !== 1;
  }

  public async getScenarios(): Promise<IO.ContentId[]> {
    const query = SQL`SELECT contentId FROM Scenario;`;
    /* eslint @typescript-eslint/no-explicit-any: 0 */
    const rows: any[] = await this.db.all(query);
    return rows.map((r) => {
      return r.contentId;
    });
  }

  public async getPublicBlob(contentId: string): Promise<unknown> {
    const query = SQL`SELECT content FROM PublicBlob WHERE contentId = ${contentId};`;
    const row = await this.db.get(query);

    if (!row) {
      return null;
    }
    return JSON.parse(row.content);
  }

  public async setPublicBlob(contentId: string, content: unknown): Promise<void> {
    const query = SQL`INSERT INTO PublicBlob (contentId, content) VALUES (${contentId}, ${JSON.stringify(content)});`;
    const result = await this.db.run(query);

    if (result.changes !== 1) {
      throw new Error(`Public blob ${contentId} already existed`);
    }
  }
}
