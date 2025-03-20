import { AnyObject, ListFilter, DocumentList } from '../spec';
import { IndexSpecification, CreateIndexesOptions } from 'mongodb';
import { Connector, Connection } from './Connector';
import string2sort from './string2sort';
import string2projection from './string2projection';

const LIMIT = 25;
const MAX_LIMIT = 500;

export class Store {
  private collection: string;
  private connector: Connector;

  constructor(connector: Connector, collection: string) {
    this.connector = connector;
    this.collection = collection;
  }

  public async createIndex(index: IndexSpecification, options?: CreateIndexesOptions): Promise<void> {
    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      await collection.createIndex(index, options);
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async count(condition?: AnyObject): Promise<number> {
    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      return await collection.countDocuments(condition || {});
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async aggregate<T>(pipeline?: AnyObject[], options?: AnyObject): Promise<T[]> {
    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      const cursor = await collection.aggregate(pipeline, options);

      const docs = [];
      for await (const doc of cursor) {
        docs.push(doc);
      }

      return docs;
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async list<T>(filter: ListFilter): Promise<DocumentList<T>> {
    if (!filter) throw new Error(`illegal argument: filter is required`);
    if (!+filter.limit) filter.limit = LIMIT;
    if (+filter.limit > MAX_LIMIT) filter.limit = MAX_LIMIT;

    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      const cursor = collection.find<T>(filter.condition || {}, {
        skip: +filter.offset || 0,
        limit: +filter.limit,
        sort: string2sort(filter.sort),
        projection: Object.assign({ _id: 0 }, string2projection(filter.fields))
      });

      const total = await collection.countDocuments(filter.condition || {});
      const rows = await cursor.toArray();

      return {
        filter,
        total,
        rows
      };
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async find<T>(filter: ListFilter): Promise<T[]> {
    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      const cursor = await collection.find<T>(filter.condition, {
        skip: filter.offset || 0,
        limit: filter.limit || LIMIT,
        sort: string2sort(filter.sort),
        projection: Object.assign({ _id: 0 }, string2projection(filter.fields))
      });
      return await cursor.toArray();
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async findOne<T>(filter: ListFilter): Promise<T> {
    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      return await collection.findOne<T>(filter.condition, {
        skip: filter.offset || 0,
        limit: 1,
        sort: string2sort(filter.sort),
        projection: Object.assign({ _id: 0 }, string2projection(filter.fields))
      });
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async insert(values: AnyObject): Promise<void> {
    const conn = await this.getConnection();
    try {
      const collection = conn.getCollection(this.collection);
      await collection.insertOne(values);
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async upsert(condition: AnyObject, values: AnyObject): Promise<void> {
    const conn = await this.getConnection();
    try {
      if (!condition || Object.keys(condition).length === 0) throw new Error('upsert condition cannot be empty object');

      const collection = conn.getCollection(this.collection);
      await collection.updateOne(condition, values, { upsert: true });
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async updateOne(condition: AnyObject, values: AnyObject): Promise<void> {
    const conn = await this.getConnection();
    try {
      if (!condition || Object.keys(condition).length === 0) throw new Error('update condition cannot be empty object');

      const collection = conn.getCollection(this.collection);
      await collection.updateOne(condition, values);
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async updateMany(condition: AnyObject, values: AnyObject): Promise<void> {
    const conn = await this.getConnection();
    try {
      if (!condition || Object.keys(condition).length === 0) throw new Error('update condition cannot be empty object');

      const collection = conn.getCollection(this.collection);
      await collection.updateMany(condition, values);
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async replace(condition: AnyObject, values: AnyObject): Promise<void> {
    const conn = await this.getConnection();
    try {
      if (!condition || Object.keys(condition).length === 0) throw new Error('update condition cannot be empty object');

      const collection = conn.getCollection(this.collection);
      await collection.replaceOne(condition, values);
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  public async remove(condition: AnyObject): Promise<void> {
    const conn = await this.getConnection();
    try {
      if (!condition || Object.keys(condition).length === 0) throw new Error('remove condition cannot be empty object');

      const collection = conn.getCollection(this.collection);
      const backup = conn.getCollection(`${this.collection}.backup`);

      const cursor = await collection.find<any>(condition);
      let doc = null;
      while ((doc = await cursor.next())) {
        delete doc._id;
        await backup.insertOne(Object.assign({}, doc, { _deleted: new Date(), _deleted_condition: condition }));
      }

      await collection.deleteMany(condition);
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  private async getConnection(): Promise<Connection> {
    return await this.connector.getConnection();
  }
}
