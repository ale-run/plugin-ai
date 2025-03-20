import { sleep } from '../spec';
import { MongoClient, Db, Collection } from 'mongodb';

export class Connection {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public getCollection(collection: string): Collection {
    return this.db.collection(collection);
  }

  public async close(): Promise<void> {
    // no action
  }
}

export class Connector {
  private init: boolean = false;
  private db: Db;
  private url: string;
  private dbname: string;

  constructor(url: string, dbname: string) {
    this.url = url;
    this.dbname = dbname;
  }

  public async getConnection(): Promise<Connection> {
    if (!this.init) {
      this.init = true;
      const client = new MongoClient(this.url, { maxPoolSize: 30, minPoolSize: 0 });
      await client.connect();
      this.db = client.db(this.dbname);
    }

    while (!this.db) await sleep(3000);

    return new Connection(this.db);
  }
}
