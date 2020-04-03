// https://github.com/kriasoft/node-sqlite#es7-asyncawait
// https://node-sql-template-strings.surge.sh/

import sqlite from 'sqlite';
import { SQL } from 'sql-template-strings';
import moment from 'moment';
import { Authority, Types } from '@internet-of-people/sdk';

import { IStorage, IRequestData } from './storage';

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

  public async addProcess(contentId: Types.Sdk.ContentId): Promise<boolean> {
    const query = SQL`INSERT INTO Process (contentId) VALUES (${contentId});`;
    const result: sqlite.Statement = await this.db.run(query);
    return result.changes !== 1;
  }

  public async getProcesses(): Promise<Types.Sdk.ContentId[]> {
    const query = SQL`SELECT contentId FROM Process;`;
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

  public async getPrivateBlob(contentId: string): Promise<unknown> {
    const query = SQL`SELECT content FROM PrivateBlob WHERE contentId = ${contentId};`;
    const row = await this.db.get(query);

    if (!row) {
      return null;
    }
    return JSON.parse(row.content);
  }

  public async setPrivateBlob(contentId: string, content: unknown): Promise<void> {
    const query = SQL`INSERT INTO PrivateBlob (contentId, content) VALUES (${contentId}, ${JSON.stringify(content)});`;
    const result = await this.db.run(query);

    if (result.changes !== 1) {
      throw new Error(`Private blob ${contentId} already existed`);
    }
  }


  public async getRequests(): Promise<IRequestData[]> {
    const query = SQL`SELECT * FROM Request;`;
    const result: IRequestData[] = [];
    await this.db.each(query, (err, row) => {
      if (err) {
        throw err;
      }
      result.push(this.rowToData(row));
    });
    return result;
  }

  public async getRequestByLink(capabilityLink: string): Promise<IRequestData | null> {
    const query = SQL`SELECT * FROM Request WHERE capabilityLink = ${capabilityLink};`;
    /* eslint @typescript-eslint/no-explicit-any: 0 */
    const row: any | null = await this.db.get(query);

    if (!row) {
      return null;
    }
    return this.rowToData(row);
  }

  public async getRequestById(requestId: string): Promise<IRequestData | null> {
    const query = SQL`SELECT * FROM Request WHERE requestId = ${requestId};`;
    /* eslint @typescript-eslint/no-explicit-any: 0 */
    const row: any | null = await this.db.get(query);

    if (!row) {
      return null;
    }
    return this.rowToData(row);
  }

  public async updateRequest(request: IRequestData): Promise<void> {
    const addedAt = this.dateIsoToUnix(request.dateOfRequest);
    const status = this.statusToNumber(request.status);
    const query = SQL`UPDATE Request SET (
        addedAt,
        status,
        processId,
        notes,
        statementId,
        rejectionReason
      ) = (
        ${addedAt},
        ${status},
        ${request.processId},
        ${request.notes},
        ${request.statementId},
        ${request.rejectionReason}
      ) WHERE
        capabilityLink = ${request.capabilityLink};`;
    const result = await this.db.run(query);

    if (result.changes !== 1) {
      throw new Error(`Request ${request.capabilityLink} could not be updated`);
    }
  }

  public async createRequest(request: IRequestData): Promise<void> {
    const addedAt = this.dateIsoToUnix(request.dateOfRequest);
    const status = this.statusToNumber(request.status);
    const query = SQL`INSERT INTO Request (
        capabilityLink,
        requestId,
        addedAt,
        status,
        processId,
        notes,
        statementId,
        rejectionReason
      ) VALUES (
        ${request.capabilityLink},
        ${request.requestId},
        ${addedAt},
        ${status},
        ${request.processId},
        ${request.notes},
        ${request.statementId},
        ${request.rejectionReason}
      );`;
    const result = await this.db.run(query);

    if (result.changes !== 1) {
      throw new Error(`Request ${request.capabilityLink} could not be updated`);
    }
  }

  private dateUnixToIso(unix: number): string {
    return moment.unix(unix).utc()
      .toISOString();
  }

  private dateIsoToUnix(iso: string): number {
    return moment(iso, moment.ISO_8601).unix();
  }

  private statusToNumber(status: Authority.Status): number {
    switch (status) {
      case Authority.Status.Pending: return 0;
      case Authority.Status.Approved: return 1;
      case Authority.Status.Rejected: return 2;
      default: throw new Error(`Unknown status ${status}`);
    }
  }

  private numberToStatus(status: number): Authority.Status {
    const result = [ Authority.Status.Pending, Authority.Status.Approved, Authority.Status.Rejected ][status];

    if (!result) {
      throw new Error(`Unknown status code ${status}`);
    }
    return result;
  }

  private rowToData(row: any): IRequestData {
    return {
      capabilityLink: row.capabilityLink,
      requestId: row.requestId,
      dateOfRequest: this.dateUnixToIso(row.addedAt),
      status: this.numberToStatus(row.status),
      processId: row.processId,
      notes: row.notes,
      statementId: row.statementId,
      rejectionReason: row.rejectionReason,
    };
  }
}
